with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

start_str = '                  {(() => {\n                    const selectedTeamType = teamTypes.find(tt => String(tt.id) === String(formData.team_type));'
if start_str not in content:
    start_str = '                  {(() => {\n                      const selectedTeamType = teamTypes.find(tt => String(tt.id) === String(formData.team_type));'
    
end_str = '                    })()}'

if start_str in content:
    start_idx = content.find(start_str)
    end_idx = content.find(end_str, start_idx) + len(end_str)
    
    # Auto-assigned team read-only indicator
    new_team_ui = """{(() => {
                      const selectedTeamType = teamTypes.find(tt => String(tt.id) === String(formData.team_type));
                      const currentLevel = selectedTeamType ? selectedTeamType.level : 0;
                      const isFullySelected = 
                        formData.team_type &&
                        (currentLevel <= 1 || formData.state) &&
                        (currentLevel <= 2 || formData.district) &&
                        (currentLevel <= 3 || formData.constituency) &&
                        (currentLevel <= 4 || formData.mandal);

                      if (!isFullySelected) {
                        return (
                          <div className="space-y-1.5 opacity-50">
                            <label className="text-sm font-medium">Target Team</label>
                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm">
                              <span className="text-muted-foreground">Select full hierarchy first</span>
                            </div>
                          </div>
                        );
                      }

                      if (filteredTeams.length === 1) {
                        return (
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Target Team</label>
                            <div className="flex h-10 w-full items-center rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm shadow-sm text-green-700 font-semibold">
                              ? {filteredTeams[0].name}
                            </div>
                          </div>
                        );
                      }

                      return (
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Target Team</label>
                            <div className="flex h-10 w-full items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm shadow-sm text-red-700 font-semibold">
                              ? No team found for this hierarchy.
                            </div>
                          </div>
                      );
                    })()}"""
    
    new_content = content[:start_idx] + new_team_ui + content[end_idx:]
    
    with open("src/components/PersonForm.jsx", "w") as f:
        f.write(new_content)
    print("Successfully replaced.")
else:
    print("Could not find start string.")
