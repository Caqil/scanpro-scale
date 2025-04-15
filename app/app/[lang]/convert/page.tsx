import { redirect } from "next/navigation";

export default function ConvertDefault() {
  // Redirect to the default conversion
  redirect("/convert/pdf-to-docx");
}