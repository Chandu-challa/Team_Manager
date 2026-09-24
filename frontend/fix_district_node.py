with open("src/app/(dashboard)/teams/page.jsx", "r", encoding="utf-8") as f:
    content = f.read()

bad = '<DistrictNode key={district.id} district={district} existingTeamsList={teams} />'
good = '<DistrictNode key={district.id} district={district} allConstituencies={allConstituencies} allMandals={allMandals} existingTeamsList={teams} searchQuery={globalSearch} />'

content = content.replace(bad, good)

with open("src/app/(dashboard)/teams/page.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed DistrictNode props!")
