import os
import cv2
import fitz
from PyPDF2 import PdfReader, PdfWriter
from pyzbar.pyzbar import decode


def convert_pdf_to_images(pdf_path, output_folder, dpi=150):
    """
    Converts a PDF into individual page images using PyMuPDF.

    Args:
        pdf_path (str): Path to the PDF file.
        output_folder (str): Folder to store the converted images.
        dpi (int): Resolution for the images.

    Returns:
        list: List of paths to the generated images.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    pdf_document = fitz.open(pdf_path)
    image_paths = []

    for page_number in range(len(pdf_document)):
        page = pdf_document[page_number]
        pix = page.get_pixmap(dpi=dpi)
        image_path = os.path.join(output_folder, f"page_{page_number + 1}.png")
        pix.save(image_path)
        image_paths.append(image_path)

    pdf_document.close()
    return image_paths


def detect_qr_code(image_path):
    """
    Detects QR codes in an image using OpenCV and pyzbar.

    Args:
        image_path (str): Path to the image.

    Returns:
        str: The detected QR code data, or None if no QR code is found.
    """
    image = cv2.imread(image_path)
    qr_codes = decode(image)
    for qr in qr_codes:
        return qr.data.decode('utf-8')  # Extract and return the QR code data
    return None


def split_pdf_by_qr_codes(pdf_path, output_folder):
    """
    Splits a PDF into separate files based on detected QR codes.

    Args:
        pdf_path (str): Path to the PDF file.
        output_folder (str): Folder to store the split PDFs.

    Returns:
        list: List of tuples with (QR code, PDF file path).
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    temp_image_folder = os.path.join(output_folder, "temp_images")
    image_paths = convert_pdf_to_images(pdf_path, temp_image_folder)

    reader = PdfReader(pdf_path)
    split_pdfs = []
    current_writer = None
    current_qr_code = None

    for page_number, image_path in enumerate(image_paths):
        qr_code = detect_qr_code(image_path)

        if qr_code:
            if current_writer and current_qr_code:
                output_pdf_path = os.path.join(output_folder, f"{current_qr_code}.pdf")
                with open(output_pdf_path, "wb") as output_file:
                    current_writer.write(output_file)
                split_pdfs.append((current_qr_code, output_pdf_path))

            current_writer = PdfWriter()
            current_qr_code = qr_code

        if current_writer:
            current_writer.add_page(reader.pages[page_number])

    if current_writer and current_qr_code:
        output_pdf_path = os.path.join(output_folder, f"{current_qr_code}.pdf")
        with open(output_pdf_path, "wb") as output_file:
            current_writer.write(output_file)
        split_pdfs.append((current_qr_code, output_pdf_path))

    # Clean up temporary images
    for image_path in image_paths:
        os.remove(image_path)
    os.rmdir(temp_image_folder)

    return split_pdfs
