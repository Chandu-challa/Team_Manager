import re

with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

# We need to find the block we inserted:
# {(() => {
#   const selectedTeamType = ...
#   ...
#   if (!isFullySelected) { ... }
#   ...
# })()}

start_str = '{(() => {\n                      const selectedTeamType = teamTypes.find(tt => String(tt.id) === String(formData.team_type));'
if start_str not in content:
    start_str = '{(() => {\n                    const selectedTeamType = teamTypes.find(tt => String(tt.id) === String(formData.team_type));'

idx = content.find(start_str)

if idx != -1:
    end_idx = content.find('})()}', idx) + 5
    
    geo_block = """{(() => {
                    const selectedTeamType = teamTypes.find(tt => String(tt.id) === String(formData.team_type));
                    const currentLevel = selectedTeamType ? selectedTeamType.level : 0;
                    
                    const isFullySelected = 
                      formData.team_type &&
                      (currentLevel <= 1 || formData.state) &&
                      (currentLevel <= 2 || formData.district) &&
                      (currentLevel <= 3 || formData.constituency) &&
                      (currentLevel <= 4 || formData.mandal);

                    return (
                      <>
                        {currentLevel >= 1 && (
                          <Combo
                            id="state"
                            label="State"
                            icon={MapPin}
                            open={openState}
                            onOpenChange={setOpenState}
                            options={statesList}
                            value={formData.state}
                            onSelect={(v) => handleSelectChange("state", v)}
                            placeholder="Select state..."
                            searchPlaceholder="Search state..."
                            emptyText="No state found."
                          />
                        )}
                        {currentLevel >= 2 && (
                          <Combo
                            id="district"
                            label="District"
                            icon={MapPin}
                            open={openDistrict}
                            onOpenChange={setOpenDistrict}
                            options={districtsList}
                            value={formData.district}
                            onSelect={(v) => handleSelectChange("district", v)}
                            placeholder={formData.state ? "Select district..." : "Select state first"}
                            searchPlaceholder="Search district..."
                            emptyText="No district found."
                            disabled={!formData.state}
                          />
                        )}
                        {currentLevel >= 3 && (
                          <Combo
                            id="constituency"
                            label="Constituency"
                            icon={MapPin}
                            open={openConstituency}
                            onOpenChange={setOpenConstituency}
                            options={constituenciesList}
                            value={formData.constituency}
                            onSelect={(v) => handleSelectChange("constituency", v)}
                            placeholder={formData.district ? "Select constituency..." : "Select district first"}
                            searchPlaceholder="Search constituency..."
                            emptyText="No constituency found."
                            disabled={!formData.district}
                          />
                        )}
                        {currentLevel >= 4 && (
                          <Combo
                            id="mandal"
                            label="Mandal"
                            icon={MapPin}
                            open={openMandal}
                            onOpenChange={setOpenMandal}
                            options={mandalsList}
                            value={formData.mandal}
                            onSelect={(v) => handleSelectChange("mandal", v)}
                            placeholder={formData.constituency ? "Select mandal..." : "Select constituency first"}
                            searchPlaceholder="Search mandal..."
                            emptyText="No mandal found."
                            disabled={!formData.constituency}
                          />
                        )}
                        
                        {!isFullySelected ? (
                          <div className="space-y-1.5 opacity-50">
                            <label className="text-sm font-medium">Target Team</label>
                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm">
                              <span className="text-muted-foreground">Select full hierarchy first</span>
                            </div>
                          </div>
                        ) : filteredTeams.length === 1 ? (
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Target Team</label>
                            <div className="flex h-10 w-full items-center rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm shadow-sm text-green-700 font-semibold">
                              ? {filteredTeams[0].name}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Target Team</label>
                            <div className="flex h-10 w-full items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm shadow-sm text-red-700 font-semibold">
                              ? No team found for this hierarchy.
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}"""

    new_content = content[:idx] + geo_block + content[end_idx:]
    
    with open("src/components/PersonForm.jsx", "w") as f:
        f.write(new_content)
    print("Dropdowns restored successfully!")
else:
    print("Start string not found.")
