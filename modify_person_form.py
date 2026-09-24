import re

with open("D:/Persons/frontend/src/components/PersonForm.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add states
state_decls = """  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [constituenciesList, setConstituenciesList] = useState([]);
  const [mandalsList, setMandalsList] = useState([]);

  const [openState, setOpenState] = useState(false);
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openConstituency, setOpenConstituency] = useState(false);
  const [openMandal, setOpenMandal] = useState(false);
"""

content = content.replace("  const [openTeamType, setOpenTeamType] = useState(false);", state_decls + "\n  const [openTeamType, setOpenTeamType] = useState(false);")

# Update formData
form_data_init = """    team_type: initialData?.team_type || "",
    state: initialData?.state || "",
    district: initialData?.district || "",
    constituency: initialData?.constituency || "",
    mandal: initialData?.mandal || "","""
content = content.replace('    team_type: initialData?.team_type || "",', form_data_init)

# Add useEffects for fetching locations
use_effects = """
  useEffect(() => {
    dataAPI.getStates().then(res => setStatesList((res || []).filter(s => s.is_active)));
  }, []);

  useEffect(() => {
    if (formData.state) {
      dataAPI.getDistricts(formData.state).then(res => setDistrictsList(res.filter(r => r.is_active)));
    } else {
      setDistrictsList([]);
    }
  }, [formData.state]);

  useEffect(() => {
    if (formData.district) {
      dataAPI.getConstituencies(formData.district).then(res => setConstituenciesList(res.filter(r => r.is_active)));
    } else {
      setConstituenciesList([]);
    }
  }, [formData.district]);

  useEffect(() => {
    if (formData.district && formData.constituency) {
      dataAPI.getMandals(formData.district, formData.constituency).then(res => setMandalsList(res.filter(r => r.is_active)));
    } else {
      setMandalsList([]);
    }
  }, [formData.district, formData.constituency]);
"""

content = content.replace("  // Cleanup object URL on unmount", use_effects + "\n  // Cleanup object URL on unmount")

# Modify handleSelectChange
handle_select_change_repl = """  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      
      if (name === "team_type") {
        next.state = ""; next.district = ""; next.constituency = ""; next.mandal = ""; next.team = "";
      } else if (name === "state") {
        next.district = ""; next.constituency = ""; next.mandal = ""; next.team = "";
      } else if (name === "district") {
        next.constituency = ""; next.mandal = ""; next.team = "";
      } else if (name === "constituency") {
        next.mandal = ""; next.team = "";
      } else if (name === "mandal") {
        next.team = "";
      }
      
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };"""

content = re.sub(r"  const handleSelectChange = \(name, value\) => \{[\s\S]*?\n  \};\n", handle_select_change_repl + "\n", content)

# Filter teams
team_filter = """  const filteredTeams = teams.filter((t) => {
    if (formData.team_type && String(t.type) !== String(formData.team_type)) return false;
    if (formData.state && String(t.state) !== String(formData.state)) return false;
    if (formData.district && String(t.district) !== String(formData.district)) return false;
    if (formData.constituency && String(t.constituency) !== String(formData.constituency)) return false;
    if (formData.mandal && String(t.mandal) !== String(formData.mandal)) return false;
    return true;
  });"""

content = re.sub(r"  const filteredTeams = teams.filter\([\s\S]*?\);\n", team_filter + "\n", content)

# Add Combos to JSX
# Find the team_type Combo and Team Combo
combos_jsx = """                  <Combo
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
                  })()}
"""

# Now carefully replace the old team_type Combo with the new combos
content = re.sub(r"                  <Combo[\s\S]*?id=\"team_type\"[\s\S]*?emptyText=\"No team type found\.\"[\s\S]*?\/>\n", combos_jsx, content)

with open("D:/Persons/frontend/src/components/PersonForm.jsx", "w", encoding="utf-8") as f:
    f.write(content)
