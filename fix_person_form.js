const fs = require('fs');

let c = fs.readFileSync('D:/Persons/frontend/src/components/PersonForm.jsx', 'utf8');

const target = `                  <Combo
                    id="team_type"
                    label="Team Type"
                    icon={Layers}
                    open={openTeamType}
                    onOpenChange={setOpenTeamType}
                    options={teamTypes}
                    value={formData.team_type}
                    onSelect={(v) => handleSelectChange("team_type", v)}
                    placeholder="Select team type..."
                    searchPlaceholder="Search team type..."
                    emptyText="No team type found."
                  />`;

const replacement = `                  <Combo
                    id="team_type"
                    label="Team Type"
                    icon={Layers}
                    open={openTeamType}
                    onOpenChange={setOpenTeamType}
                    options={teamTypes}
                    value={formData.team_type}
                    onSelect={(v) => handleSelectChange("team_type", v)}
                    placeholder="Select team type..."
                    searchPlaceholder="Search team type..."
                    emptyText="No team type found."
                  />
                  
                  {(() => {
                    const selectedTeamType = teamTypes.find(tt => String(tt.id) === String(formData.team_type));
                    const currentLevel = selectedTeamType ? selectedTeamType.level : 0;
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
                      </>
                    );
                  })()}`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('D:/Persons/frontend/src/components/PersonForm.jsx', c);
  console.log("Success! Replaced JSX.");
} else {
  console.log("Error: Target JSX not found exactly.");
}
