import re

with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

# We want to remove everything from `{!isFullySelected ? (` to the end of the `) : (` blocks.
# Let's find the `{!isFullySelected ? (` and delete it and everything until the end of the JSX block.
start_str = '{!isFullySelected ? ('
end_str = '                  })()}'

idx = content.find(start_str)
if idx != -1:
    end_idx = content.find(end_str, idx)
    
    # We replace from start_str to end_idx with just nothing, so the `</>` closes properly.
    # Wait, the block was:
    # {!isFullySelected ? ( ... ) : filteredTeams.length === 1 ? ( ... ) : ( ... )}
    
    # Let's just do a string slice.
    new_content = content[:idx] + "\n" + content[end_idx:]
    
    with open("src/components/PersonForm.jsx", "w") as f:
        f.write(new_content)
    print("Target Team UI completely removed.")
else:
    print("Target Team block not found.")
