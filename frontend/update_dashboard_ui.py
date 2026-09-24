import re

with open("src/app/(dashboard)/page.jsx", "r") as f:
    content = f.read()

# Add Dialog imports
if "Dialog" not in content:
    content = content.replace(
        'import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";',
        'import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";\nimport { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";\nimport { Button } from "@/components/ui/button";'
    )

# Replace the specific UI blocks for Coverage to include Dialogs
new_main_coverage = """              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Main Team Coverage</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="h-auto p-0 text-sm font-bold text-blue-600 hover:text-blue-800">
                      {summary.mandals_main_covered} / {summary.mandals_total}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Mandals Missing Main Teams</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 mt-4">
                      {summary.missing_main?.map(m => (
                        <div key={m.id} className="text-sm p-2 bg-secondary rounded-md">
                          <span className="font-semibold">{m.name}</span> <span className="text-muted-foreground text-xs">({m.district__name})</span>
                        </div>
                      ))}
                      {summary.missing_main?.length === 0 && <p className="text-sm text-muted-foreground">All mandals covered!</p>}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>"""

new_youth_coverage = """              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Youth Team Coverage</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="h-auto p-0 text-sm font-bold text-orange-600 hover:text-orange-800">
                      {summary.mandals_youth_covered} / {summary.mandals_total}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Mandals Missing Youth Teams</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 mt-4">
                      {summary.missing_youth?.map(m => (
                        <div key={m.id} className="text-sm p-2 bg-secondary rounded-md">
                          <span className="font-semibold">{m.name}</span> <span className="text-muted-foreground text-xs">({m.district__name})</span>
                        </div>
                      ))}
                      {summary.missing_youth?.length === 0 && <p className="text-sm text-muted-foreground">All mandals covered!</p>}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>"""

content = re.sub(
    r'<div className="flex items-center justify-between">\s*<span className="text-sm font-medium">Main Team Coverage</span>\s*<span className="text-sm font-bold">\{summary\.mandals_main_covered\} / \{summary\.mandals_total\}</span>\s*</div>',
    new_main_coverage,
    content
)

content = re.sub(
    r'<div className="flex items-center justify-between">\s*<span className="text-sm font-medium">Youth Team Coverage</span>\s*<span className="text-sm font-bold">\{summary\.mandals_youth_covered\} / \{summary\.mandals_total\}</span>\s*</div>',
    new_youth_coverage,
    content
)

with open("src/app/(dashboard)/page.jsx", "w") as f:
    f.write(content)
print("Updated dashboard UI with Dialogs for missing teams")
