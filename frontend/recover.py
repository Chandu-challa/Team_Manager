import re

with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

# We know the file has `content[:start_idx] + new_team_ui + content[16:]`.
# We need to find the `new_team_ui` boundary.
marker = "? No team found for this hierarchy."
idx = content.find(marker)
if idx == -1:
    print("Marker not found")
else:
    # Find the end of new_team_ui
    end_of_new_ui = content.find("})()}", idx) + 5
    
    # After end_of_new_ui, we have `React, { useState...` which is the start of the duplicated file.
    duplicated_content = '"use client";\n\nimport ' + content[end_of_new_ui:]
    
    # We need to find the start_idx inside duplicated_content
    start_str = '                  {(() => {\n'
    # we need the exact block of the team combo
    team_combo_start = duplicated_content.find('label="Team"')
    
    if team_combo_start != -1:
        # Find the end of the combo block
        team_combo_end = duplicated_content.find('})()}', team_combo_start) + 5
        
        # The correct bottom half is everything in duplicated_content AFTER team_combo_end!
        bottom_half = duplicated_content[team_combo_end:]
        
        correct_content = content[:end_of_new_ui] + bottom_half
        
        with open("src/components/PersonForm.jsx", "w") as f:
            f.write(correct_content)
        print("Successfully recovered the file!")
    else:
        print("Team combo not found in duplicated content")
