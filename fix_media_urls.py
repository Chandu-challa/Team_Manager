import re

with open(r"D:\Team_Manager\backend\backend\urls.py", "r", encoding="utf-8") as f:
    content = f.read()

bad = """if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)"""

good = """from django.urls import re_path
from django.views.static import serve

# Unconditionally serve media files so they work on both local and Render without S3.
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]
"""

if bad in content:
    content = content.replace(bad, good)
    with open(r"D:\Team_Manager\backend\backend\urls.py", "w", encoding="utf-8") as f:
        f.write(content)
    
    # Mirror it to D:\Persons
    with open(r"D:\Persons\backend\backend\urls.py", "w", encoding="utf-8") as f:
        f.write(content)
    
    print("Fixed urls.py!")
else:
    print("Could not find the block to replace!")
