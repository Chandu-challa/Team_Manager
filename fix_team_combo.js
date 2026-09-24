const fs = require('fs');
let c = fs.readFileSync('D:/Persons/frontend/src/components/PersonForm.jsx', 'utf8');

const regexTeam = /<Combo\s+id="team"[\s\S]*?disabled=\{!formData\.team_type\}\s*\/>/;

const replacementTeam = `{(() => {
                    const selectedTeamType = teamTypes.find(tt => String(tt.id) === String(formData.team_type));
                    const currentLevel = selectedTeamType ? selectedTeamType.level : 0;
                    const isTeamEnabled = 
                      formData.team_type &&
                      (currentLevel < 1 || formData.state) &&
                      (currentLevel < 2 || formData.district) &&
                      (currentLevel < 3 || formData.constituency) &&
                      (currentLevel < 4 || formData.mandal);
                    
                    return (
                      <Combo
                        id="team"
                        label="Team"
                        icon={Users}
                        open={openTeam}
                        onOpenChange={setOpenTeam}
                        options={filteredTeams.map(t => ({ ...t, name: t.display_name || t.name }))}
                        value={formData.team}
                        onSelect={(v) => handleSelectChange("team", v)}
                        placeholder={isTeamEnabled ? "Select team..." : "Complete hierarchy first"}
                        searchPlaceholder="Search team..."
                        emptyText="No team found."
                        disabled={!isTeamEnabled}
                      />
                    );
                  })()}`;

if (c.match(regexTeam)) {
  c = c.replace(regexTeam, replacementTeam);
  fs.writeFileSync('D:/Persons/frontend/src/components/PersonForm.jsx', c);
  console.log('Success replacing Team Combo!');
} else {
  console.log('Regex failed for Team Combo');
}
