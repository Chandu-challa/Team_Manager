with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

bad_str = """                        )}
                        
                        
                  })()}"""

good_str = """                        )}
                      </>
                    );
                  })()}"""

content = content.replace(bad_str, good_str)

with open("src/components/PersonForm.jsx", "w") as f:
    f.write(content)
print("JSX fixed!")
