from pypdf import PdfReader


class ParserService:
    async def pdf_to_text(self, pdf_path: str) -> str:
        reader = PdfReader(pdf_path)
        pages_text: list[str] = []
        for page in reader.pages:
            pages_text.append(page.extract_text() or '')
        return '\n'.join(pages_text).strip()
