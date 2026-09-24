import re

with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

# 1. Update the handleSubmit logic to inject the team ID automatically from filteredTeams
submit_regex = r'(const handleSubmit = async \(e, addAnother = false\) => \{\s*e\.preventDefault\(\);\s*if \(!validate\(\)\) \{\s*toast\.error\("Please fix the errors before submitting\."\);\s*return;\s*\})'

new_submit = r"""\1
    if (filteredTeams.length !== 1) {
      toast.error("Valid team not found for this hierarchy. Please create the team first.");
      return;
    }
    const finalData = { ...formData, team: filteredTeams[0].id };
"""

# wait, we need to pass finalData to create/update instead of formData
content = re.sub(submit_regex, new_submit, content)
content = content.replace("await dataAPI.updatePerson(initialData.id, formData);", "await dataAPI.updatePerson(initialData.id, finalData);")
content = content.replace("await dataAPI.createPerson(formData);", "await dataAPI.createPerson(finalData);")


# 2. Replace the Team Combo with a read-only indicator
team_combo_regex = r'\{\s*/\*\s*TEAM DROPDOWN\s*\*/\s*\}\s*\{\(\) => \{\s*const isTeamDisabled =.*?\s*return \(\s*<Combo\s*id="team".*?/>\s*\);\s*\}\}\(\)\}'

# Wait, I don't know the exact regex for the Team Combo. I'll just find the exact block using string replacement.
