import os
import tempfile
from PyPDF2 import PdfReader, PdfWriter
import ocrmypdf

def split_pdf(input_path, chunk_size=20):
    reader = PdfReader(input_path)
    total_pages = len(reader.pages)
    chunks = []

    for start in range(0, total_pages, chunk_size):
        writer = PdfWriter()
        for page_num in range(start, min(start + chunk_size, total_pages)):
            writer.add_page(reader.pages[page_num])
        temp_path = tempfile.mktemp(suffix=".pdf")
        with open(temp_path, "wb") as f:
            writer.write(f)
        chunks.append(temp_path)
    return chunks

def ocr_pdf(input_pdf, output_pdf, language="eng"):
    ocrmypdf.ocr(
        input_pdf,
        output_pdf,
        language=language,
        deskew=True,
        optimize=1,
        jobs=1,
        skip_text=True,  # Equivalent to --skip-text in your JS
        use_threads=True,
        tesseract_pagesegmode=6,
        image_dpi=150,
    )

def merge_pdfs(pdf_list, output_path):
    writer = PdfWriter()
    for pdf in pdf_list:
        reader = PdfReader(pdf)
        for page in reader.pages:
            writer.add_page(page)
    with open(output_path, "wb") as f:
        writer.write(f)

def ocr_in_chunks(input_pdf, final_output, language="eng"):
    print("🔹 Splitting PDF...")
    chunks = split_pdf(input_pdf)

    ocred_chunks = []
    for i, chunk in enumerate(chunks):
        output = tempfile.mktemp(suffix=f"_ocr_{i}.pdf")
        print(f"🔸 OCR on chunk {i+1}/{len(chunks)}...")
        ocr_pdf(chunk, output, language)
        ocred_chunks.append(output)

    print("🔹 Merging OCRed PDFs...")
    merge_pdfs(ocred_chunks, final_output)

    print("✅ Done! OCRed PDF saved to:", final_output)

# Example usage
if __name__ == "__main__":
    import sys
    input_pdf = sys.argv[1] if len(sys.argv) > 1 else "bigfile.pdf"
    final_output = sys.argv[2] if len(sys.argv) > 2 else "bigfile_ocr.pdf"
    language = sys.argv[3] if len(sys.argv) > 3 else "eng"
    ocr_in_chunks(input_pdf, final_output, language)
