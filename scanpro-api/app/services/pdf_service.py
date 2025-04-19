import os
import asyncio
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union, BinaryIO
import subprocess
import io
import uuid
import json
from PIL import Image
import fitz  # PyMuPDF
from PyPDF2 import PdfReader, PdfWriter

from app.core.config import settings
from app.services.file_storage import file_storage

class PDFService:
    """Service for handling PDF operations"""
    
    @staticmethod
    async def get_page_count(pdf_path: Path) -> int:
        """
        Get the number of pages in a PDF document
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Number of pages in the PDF
        """
        try:
            # Using PyMuPDF (fitz)
            doc = fitz.open(pdf_path)
            page_count = len(doc)
            doc.close()
            return page_count
        except Exception as e:
            print(f"PyMuPDF error: {e}")
            
            try:
                # Fallback to PyPDF2
                with open(pdf_path, "rb") as f:
                    reader = PdfReader(f)
                    return len(reader.pages)
            except Exception as e2:
                print(f"PyPDF2 error: {e2}")
                
                try:
                    # Fallback to command line tools if available
                    result = subprocess.run(
                        ["qpdf", "--show-npages", str(pdf_path)],
                        capture_output=True,
                        text=True,
                        check=True
                    )
                    return int(result.stdout.strip())
                except Exception as e3:
                    print(f"qpdf error: {e3}")
                    
                    try:
                        # Try with ghostscript
                        gs_command = "gswin64c" if os.name == "nt" else "gs"
                        result = subprocess.run(
                            [gs_command, "-q", "-dNODISPLAY", "-c", 
                             f"({pdf_path}) (r) file runpdfbegin pdfpagecount = quit"],
                            capture_output=True,
                            text=True,
                            check=True
                        )
                        return int(result.stdout.strip())
                    except Exception as e4:
                        print(f"ghostscript error: {e4}")
                        
                        # Return a default if all methods fail
                        return 0
    
    @staticmethod
    async def extract_text(pdf_path: Path, page_numbers: Optional[List[int]] = None) -> str:
        """
        Extract text from a PDF document
        
        Args:
            pdf_path: Path to the PDF file
            page_numbers: Optional list of page numbers to extract text from
            
        Returns:
            Extracted text
        """
        try:
            # Using PyMuPDF (fitz)
            doc = fitz.open(pdf_path)
            
            if page_numbers:
                # Convert from 1-based to 0-based indexing
                pages = [doc[i-1] for i in page_numbers if 0 < i <= len(doc)]
            else:
                pages = doc
            
            text = ""
            for page in pages:
                text += page.get_text()
            
            doc.close()
            return text
        except Exception as e:
            print(f"PyMuPDF error: {e}")
            
            try:
                # Fallback to pdftotext command line tool if available
                args = ["pdftotext"]
                
                # Add page range if specified
                if page_numbers:
                    # Convert to 1-based indexing for pdftotext
                    min_page = min(page_numbers)
                    max_page = max(page_numbers)
                    args.extend(["-f", str(min_page), "-l", str(max_page)])
                
                with tempfile.NamedTemporaryFile(suffix=".txt") as tmp:
                    args.extend([str(pdf_path), tmp.name])
                    
                    subprocess.run(args, check=True)
                    
                    with open(tmp.name, "r", encoding="utf-8") as f:
                        return f.read()
            except Exception as e2:
                print(f"pdftotext error: {e2}")
                
                try:
                    # Fallback to PyPDF2
                    with open(pdf_path, "rb") as f:
                        reader = PdfReader(f)
                        
                        if page_numbers:
                            # Convert from 1-based to 0-based indexing
                            pages = [reader.pages[i-1] for i in page_numbers 
                                    if 0 < i <= len(reader.pages)]
                        else:
                            pages = reader.pages
                        
                        text = ""
                        for page in pages:
                            text += page.extract_text() or ""
                        
                        return text
                except Exception as e3:
                    print(f"PyPDF2 error: {e3}")
                    
                    # Return error message if all methods fail
                    return "[Error: Text extraction failed]"
    
    @staticmethod
    async def rotate_pages(
        pdf_path: Path, 
        output_path: Path, 
        rotations: List[Dict[str, Union[int, List[int]]]],
    ) -> bool:
        """
        Rotate pages in a PDF document
        
        Args:
            pdf_path: Path to the PDF file
            output_path: Path to save the rotated PDF
            rotations: List of dicts with page numbers and rotation angles
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Try with PyPDF2 first
            with open(pdf_path, "rb") as input_file:
                reader = PdfReader(input_file)
                writer = PdfWriter()
                
                # Add all pages to the writer
                for i in range(len(reader.pages)):
                    writer.add_page(reader.pages[i])
                
                # Apply rotations
                for rotation_info in rotations:
                    page_numbers = rotation_info.get("page_numbers", [])
                    angle = rotation_info.get("angle", 0)
                    
                    # Normalize angle to 0, 90, 180, 270
                    normalized_angle = ((angle % 360) + 360) % 360
                    
                    # Apply rotation to each page
                    for page_num in page_numbers:
                        # Convert from 1-based to 0-based indexing
                        idx = page_num - 1
                        if 0 <= idx < len(writer.pages):
                            # Get current rotation and add new rotation
                            current_rotation = writer.pages[idx].rotation or 0
                            new_rotation = (current_rotation + normalized_angle) % 360
                            writer.pages[idx].rotation = new_rotation
                
                # Write the rotated PDF
                with open(output_path, "wb") as output_file:
                    writer.write(output_file)
                
                return True
        except Exception as e:
            print(f"PyPDF2 error: {e}")
            
            try:
                # Fallback to qpdf command line tool if available
                args = ["qpdf", str(pdf_path)]
                
                # Add rotation parameters
                for rotation_info in rotations:
                    page_numbers = rotation_info.get("page_numbers", [])
                    angle = rotation_info.get("angle", 0)
                    
                    # Normalize angle to 0, 90, 180, 270
                    normalized_angle = ((angle % 360) + 360) % 360
                    
                    # Apply rotation to each page
                    for page_num in page_numbers:
                        args.append(f"--rotate={normalized_angle}:{page_num}")
                
                args.append(str(output_path))
                
                subprocess.run(args, check=True)
                return True
            except Exception as e2:
                print(f"qpdf error: {e2}")
                
                try:
                    # Try with PyMuPDF (fitz)
                    doc = fitz.open(pdf_path)
                    
                    # Apply rotations
                    for rotation_info in rotations:
                        page_numbers = rotation_info.get("page_numbers", [])
                        angle = rotation_info.get("angle", 0)
                        
                        # Normalize angle to 0, 90, 180, 270
                        normalized_angle = ((angle % 360) + 360) % 360
                        
                        # Apply rotation to each page
                        for page_num in page_numbers:
                            # Convert from 1-based to 0-based indexing
                            idx = page_num - 1
                            if 0 <= idx < len(doc):
                                # fitz uses degrees in 90-degree increments
                                doc[idx].set_rotation(normalized_angle)
                    
                    # Save the document
                    doc.save(output_path)
                    doc.close()
                    
                    return True
                except Exception as e3:
                    print(f"PyMuPDF error: {e3}")
                    return False
    
    @staticmethod
    async def merge_pdfs(pdf_paths: List[Path], output_path: Path) -> bool:
        """
        Merge multiple PDF documents into one
        
        Args:
            pdf_paths: List of paths to PDF files
            output_path: Path to save the merged PDF
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Try with PyPDF2
            writer = PdfWriter()
            
            for pdf_path in pdf_paths:
                with open(pdf_path, "rb") as f:
                    reader = PdfReader(f)
                    for page in reader.pages:
                        writer.add_page(page)
            
            with open(output_path, "wb") as f:
                writer.write(f)
            
            return True
        except Exception as e:
            print(f"PyPDF2 error: {e}")
            
            try:
                # Fallback to qpdf command line tool if available
                args = ["qpdf", "--empty"]
                
                # Add pages from each PDF
                args.append("--pages")
                for pdf_path in pdf_paths:
                    args.extend([str(pdf_path), "--"])
                
                # Add output path
                args.append(str(output_path))
                
                subprocess.run(args, check=True)
                return True
            except Exception as e2:
                print(f"qpdf error: {e2}")
                
                try:
                    # Try with PyMuPDF (fitz)
                    merged_doc = fitz.open()
                    
                    for pdf_path in pdf_paths:
                        doc = fitz.open(pdf_path)
                        merged_doc.insert_pdf(doc)
                        doc.close()
                    
                    merged_doc.save(output_path)
                    merged_doc.close()
                    
                    return True
                except Exception as e3:
                    print(f"PyMuPDF error: {e3}")
                    return False
    
    @staticmethod
    async def split_pdf(
        pdf_path: Path, 
        output_dir: Path, 
        split_method: str,
        page_ranges: Optional[str] = None,
        every_n_pages: Optional[int] = None,
    ) -> List[Dict[str, Union[str, List[int], int]]]:
        """
        Split a PDF document
        
        Args:
            pdf_path: Path to the PDF file
            output_dir: Directory to save the split PDFs
            split_method: Method to split the PDF (range, extract, every)
            page_ranges: Comma-separated page ranges (e.g., "1-3,5,7-9")
            every_n_pages: Number of pages per split
            
        Returns:
            List of dicts with split PDF info
        """
        try:
            # Get page count
            total_pages = await PDFService.get_page_count(pdf_path)
            if total_pages == 0:
                return []
            
            # Determine which pages to extract
            page_sets = []
            
            if split_method == "range" and page_ranges:
                # Parse page ranges
                parts = page_ranges.split(",")
                
                for part in parts:
                    part = part.strip()
                    if not part:
                        continue
                    
                    if "-" in part:
                        # Range of pages
                        start_str, end_str = part.split("-")
                        start = int(start_str.strip())
                        end = int(end_str.strip())
                        
                        if start <= end and start > 0 and end <= total_pages:
                            page_sets.append(list(range(start, end + 1)))
                    else:
                        # Single page
                        page_num = int(part)
                        if 0 < page_num <= total_pages:
                            page_sets.append([page_num])
            elif split_method == "extract":
                # Extract each page as a separate PDF
                page_sets = [[i] for i in range(1, total_pages + 1)]
            elif split_method == "every":
                # Split every N pages
                n = max(1, every_n_pages or 1)
                
                for i in range(1, total_pages + 1, n):
                    end = min(i + n - 1, total_pages)
                    page_sets.append(list(range(i, end + 1)))
            
            # Process each page set
            results = []
            
            for i, pages in enumerate(page_sets):
                output_filename = f"{output_dir.stem}-{i+1}.pdf"
                output_path = output_dir / output_filename
                
                try:
                    # Using PyPDF2
                    with open(pdf_path, "rb") as input_file:
                        reader = PdfReader(input_file)
                        writer = PdfWriter()
                        
                        for page_num in pages:
                            # Convert from 1-based to 0-based indexing
                            idx = page_num - 1
                            if 0 <= idx < len(reader.pages):
                                writer.add_page(reader.pages[idx])
                        
                        with open(output_path, "wb") as output_file:
                            writer.write(output_file)
                except Exception as e:
                    print(f"PyPDF2 error: {e}")
                    continue
                
                results.append({
                    "file_url": f"/api/file?folder=splits&filename={output_filename}",
                    "filename": output_filename,
                    "pages": pages,
                    "page_count": len(pages)
                })
            
            return results
        except Exception as e:
            print(f"Error splitting PDF: {e}")
            return []
    
    @staticmethod
    async def add_page_numbers(
        pdf_path: Path,
        output_path: Path,
        format: str = "numeric",
        position: str = "bottom-center",
        font_family: str = "Helvetica",
        font_size: int = 12,
        color: str = "#000000",
        start_number: int = 1,
        prefix: str = "",
        suffix: str = "",
        margin_x: int = 40,
        margin_y: int = 30,
        selected_pages: str = "",
        skip_first_page: bool = False,
    ) -> Dict[str, Union[bool, int]]:
        """
        Add page numbers to a PDF document
        
        Args:
            pdf_path: Path to the PDF file
            output_path: Path to save the numbered PDF
            format: Number format (numeric, roman, alphabetic)
            position: Position of page numbers
            font_family: Font family
            font_size: Font size
            color: Text color
            start_number: Starting page number
            prefix: Prefix for page numbers
            suffix: Suffix for page numbers
            margin_x: Horizontal margin
            margin_y: Vertical margin
            selected_pages: Comma-separated page ranges
            skip_first_page: Whether to skip the first page
            
        Returns:
            Dict with result info
        """
        try:
            # Get page count
            total_pages = await PDFService.get_page_count(pdf_path)
            if total_pages == 0:
                return {
                    "success": False,
                    "total_pages": 0,
                    "numbered_pages": 0
                }
            
            # Determine which pages to number
            pages_to_number = []
            
            if selected_pages:
                # Parse page ranges
                parts = selected_pages.split(",")
                
                for part in parts:
                    part = part.strip()
                    if not part:
                        continue
                    
                    if "-" in part:
                        # Range of pages
                        start_str, end_str = part.split("-")
                        start = int(start_str.strip())
                        end = int(end_str.strip())
                        
                        if start <= end and start > 0 and end <= total_pages:
                            pages_to_number.extend(list(range(start, end + 1)))
                    else:
                        # Single page
                        page_num = int(part)
                        if 0 < page_num <= total_pages:
                            pages_to_number.append(page_num)
            else:
                # Number all pages
                pages_to_number = list(range(1, total_pages + 1))
            
            # Skip first page if requested
            if skip_first_page and 1 in pages_to_number:
                pages_to_number.remove(1)
            
            # Remove duplicates and sort
            pages_to_number = sorted(set(pages_to_number))
            
            # Format page numbers
            def format_page_number(page_num: int) -> str:
                actual_number = page_num + start_number - 1
                
                if format == "roman":
                    # Convert to Roman numerals
                    def to_roman(num: int) -> str:
                        val = [
                            1000, 900, 500, 400,
                            100, 90, 50, 40,
                            10, 9, 5, 4,
                            1
                        ]
                        syms = [
                            "M", "CM", "D", "CD",
                            "C", "XC", "L", "XL",
                            "X", "IX", "V", "IV",
                            "I"