import re

with open("src/app/(dashboard)/persons/page.jsx", "r") as f:
    content = f.read()

export_function = """  const handleExport = () => {
    if (!persons.length) return;
    const headers = ["Name", "Designation", "Phone", "Email", "Team", "Team Type"];
    const rows = persons.map(p => [
      `"${p.name || ""}"`,
      `"${p.designation || ""}"`,
      `"${p.phone || ""}"`,
      `"${p.email || ""}"`,
      `"${p.team_name || ""}"`,
      `"${p.team_type_name || ""}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "persons_roster.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (checked) => {"""

content = content.replace("  const handleSelectAll = (checked) => {", export_function)

# Add Download icon import
if "Download" not in content:
    content = content.replace("Plus,", "Plus, Download,")

# Add Export Button
export_button = """          <div className="flex gap-2">
            <Button variant="outline" className="h-9" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Roster
            </Button>
            <Link href="/persons/add">"""

content = content.replace('          <div className="flex gap-2">\n            <Link href="/persons/add">', export_button)
content = content.replace('          <div className="flex gap-2">\r\n            <Link href="/persons/add">', export_button)

with open("src/app/(dashboard)/persons/page.jsx", "w") as f:
    f.write(content)
print("Added Export CSV functionality to persons page")
