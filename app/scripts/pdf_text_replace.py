#!/usr/bin/env python3

import fitz  # PyMuPDF
import sys
import json
import argparse

def get_text_properties(page, text_instance):
    """
    Extract font size and other properties of the text instance.
    
    Args:
        page: The PDF page object
        text_instance: The text instance from page.get_text("words")
    
    Returns:
        dict: Properties including font size
    """
    try:
        # Get detailed text information using get_text("dict")
        text_blocks = page.get_text("dict")["blocks"]
        for block in text_blocks:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        # Check if the span contains our text
                        if text_instance[4] in span["text"]:
                            return {
                                "font_size": span["size"],
                                "font": span["font"],
                                "color": span["color"]
                            }
    except Exception as e:
        print(f"Error getting text properties: {e}")
    # Fallback to default values
    return {"font_size": 11, "font": "helv", "color": 0}

def replace_text_in_pdf(input_path, output_path, replacements):
    """
    Replace specified text in a PDF file and save the result.
    
    Args:
        input_path (str): Path to input PDF file
        output_path (str): Path to save modified PDF
        replacements (dict): Dictionary of old_text: new_text pairs
    
    Returns:
        dict: Result containing success status and modification details
    """
    try:
        # Open the PDF
        doc = fitz.open(input_path)
        
        replacements_made = 0
        pages_modified = set()
        
        # Iterate through each page
        for page_num in range(len(doc)):
            page = doc[page_num]
            text_instances = {}
            
            # Get all text instances on the page
            for text in page.get_text("words"):
                word = text[4]  # The actual text content
                for old_text in replacements:
                    if old_text == word:  # Exact match for better precision
                        if old_text not in text_instances:
                            text_instances[old_text] = []
                        text_instances[old_text].append(text)
            
            # Perform replacements
            for old_text, new_text in replacements.items():
                if old_text in text_instances:
                    for instance in text_instances[old_text]:
                        # Get coordinates
                        x0, y0, x1, y1 = instance[0:4]
                        
                        # Get text properties
                        props = get_text_properties(page, instance)
                        font_size = props["font_size"]
                        
                        # Create a rectangle to cover the old text
                        # Slightly expand the rectangle to ensure full coverage
                        rect = fitz.Rect(x0 - 2, y0 - 2, x1 + 2, y1 + 2)
                        
                        # White out the old text
                        page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
                        
                        # Calculate the baseline for the new text
                        # y0 is the top, y1 is the bottom; adjust to align with baseline
                        baseline_y = y1 - (font_size * 0.2)  # Approximate baseline adjustment
                        
                        # Add new text at the adjusted position
                        page.insert_text(
                            (x0, baseline_y),  # Start at the original x0, adjusted y
                            new_text,
                            fontsize=font_size,
                            fontname="helv",  # Use a default font; can be improved
                            color=(0, 0, 0)  # Black text
                        )
                        
                        replacements_made += 1
                        pages_modified.add(page_num)
        
        # Save the modified PDF
        doc.save(output_path)
        doc.close()
        
        return {
            "success": True,
            "replacements_made": replacements_made,
            "pages_modified": len(pages_modified)
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Replace text in a PDF file")
    parser.add_argument("input_file", help="Path to input PDF file")
    parser.add_argument("output_file", help="Path to output PDF file")
    parser.add_argument("replacements", nargs="+", help="Text replacements in 'old|new' format")
    parser.add_argument("--json", action="store_true", help="Output result as JSON")
    
    args = parser.parse_args()
    
    # Parse replacements
    replacements = {}
    try:
        for replacement in args.replacements:
            old_text, new_text = replacement.split("|", 1)
            replacements[old_text] = new_text
    except ValueError as e:
        result = {"success": False, "error": "Invalid replacement format. Use 'old|new'"}
        print(json.dumps(result))
        sys.exit(1)
    
    # Perform text replacement
    result = replace_text_in_pdf(args.input_file, args.output_file, replacements)
    
    # Output result
    if args.json:
        print(json.dumps(result))
    else:
        if result["success"]:
            print(f"Successfully processed PDF. Made {result['replacements_made']} replacements "
                  f"across {result['pages_modified']} pages.")
        else:
            print(f"Error: {result['error']}")

if __name__ == "__main__":
    main()