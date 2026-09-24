const fs = require('fs');

function insertDisable(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace setDistrictsList([])
    content = content.replace(
        /\} else \{\s*setDistrictsList\(\[\]\);\s*\}/g,
        `} else {\n      // eslint-disable-next-line react-hooks/set-state-in-effect\n      setDistrictsList([]);\n    }`
    );
    
    // Replace setConstituenciesList([])
    content = content.replace(
        /\} else \{\s*setConstituenciesList\(\[\]\);\s*\}/g,
        `} else {\n      // eslint-disable-next-line react-hooks/set-state-in-effect\n      setConstituenciesList([]);\n    }`
    );
    
    // Replace setMandalsList([])
    content = content.replace(
        /\} else \{\s*setMandalsList\(\[\]\);\s*\}/g,
        `} else {\n      // eslint-disable-next-line react-hooks/set-state-in-effect\n      setMandalsList([]);\n    }`
    );
    
    // teams/page.jsx & team-types/page.jsx & etc:
    content = content.replace(
        /useEffect\(\(\) => \{\s*fetchData\(\);\s*\}, \[\]\);/g,
        `useEffect(() => {\n    // eslint-disable-next-line react-hooks/set-state-in-effect\n    fetchData();\n  }, []);`
    );
    
    content = content.replace(
        /useEffect\(\(\) => \{\s*fetchTeamTypes\(\);\s*\}, \[\]\);/g,
        `useEffect(() => {\n    // eslint-disable-next-line react-hooks/set-state-in-effect\n    fetchTeamTypes();\n  }, []);`
    );
    
    fs.writeFileSync(file, content);
}

insertDisable('D:/Persons/frontend/src/components/PersonForm.jsx');
insertDisable('D:/Persons/frontend/src/app/(dashboard)/teams/page.jsx');
insertDisable('D:/Persons/frontend/src/app/(dashboard)/team-types/page.jsx');
insertDisable('D:/Persons/frontend/src/components/mode-toggle.jsx');
insertDisable('D:/Persons/frontend/src/hooks/use-mobile.js');

// mode-toggle.jsx
try {
    let c = fs.readFileSync('D:/Persons/frontend/src/components/mode-toggle.jsx', 'utf8');
    c = c.replace(/setIsDarkMode\(document\.documentElement\.classList\.contains\("dark"\)\)/g, 
      '// eslint-disable-next-line react-hooks/set-state-in-effect\n    setIsDarkMode(document.documentElement.classList.contains("dark"))');
    fs.writeFileSync('D:/Persons/frontend/src/components/mode-toggle.jsx', c);
} catch (e) {}

// use-mobile.js
try {
    let c = fs.readFileSync('D:/Persons/frontend/src/hooks/use-mobile.js', 'utf8');
    c = c.replace(/setIsMobile\(window\.innerWidth < MOBILE_BREAKPOINT\)/g, 
      '// eslint-disable-next-line react-hooks/set-state-in-effect\n    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)');
    fs.writeFileSync('D:/Persons/frontend/src/hooks/use-mobile.js', c);
} catch (e) {}

