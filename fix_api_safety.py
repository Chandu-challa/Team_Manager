with open(r"D:\Team_Manager\frontend\src\lib\api.js", "r", encoding="utf-8") as f:
    content = f.read()

# We need to prepend the backend base URL to the photo if it's a relative path starting with /media.
safety_logic = """
// Helper to ensure absolute media URLs
const ensureAbsoluteUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/media')) {
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${url}`;
  }
  return url;
};
"""

if "ensureAbsoluteUrl" not in content:
    content = content.replace("const api = axios.create({", safety_logic + "\nconst api = axios.create({")
    
    # Update getPersons
    old_get_persons = """  getPersons: async (params) => {
    const response = await api.get("/persons/", { params });
    
    return response.data;
  },"""
    new_get_persons = """  getPersons: async (params) => {
    const response = await api.get("/persons/", { params });
    if (response.data?.results) {
      response.data.results.forEach(p => p.photo = ensureAbsoluteUrl(p.photo));
    }
    return response.data;
  },"""
    
    content = content.replace(old_get_persons, new_get_persons)
    
    # Also if they are missing the block because of my previous script
    if 'getPersons: async (params) => {\n    const response = await api.get("/persons/", { params });\n    return response.data;\n  },' in content:
        content = content.replace('getPersons: async (params) => {\n    const response = await api.get("/persons/", { params });\n    return response.data;\n  },', new_get_persons)
        
    # Let's use regex to safely replace getPersons and getPerson
    import re
    content = re.sub(r'getPersons:\s*async\s*\(params\)\s*=>\s*\{.*?(?:return\s*response\.data;)\s*\},', 
                     new_get_persons, content, flags=re.DOTALL)
                     
    new_get_person = """  getPerson: async (id) => {
    const response = await api.get(`/persons/${id}/`);
    const p = response.data;
    if (p) p.photo = ensureAbsoluteUrl(p.photo);
    return p;
  },"""
    content = re.sub(r'getPerson:\s*async\s*\(id\)\s*=>\s*\{.*?(?:return\s*p;)\s*\},',
                     new_get_person, content, flags=re.DOTALL)
                     
    with open(r"D:\Team_Manager\frontend\src\lib\api.js", "w", encoding="utf-8") as f:
        f.write(content)
        
    with open(r"D:\Persons\frontend\src\lib\api.js", "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Fixed api.js safety!")
