#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kordir.settings")
    # Setup django
    import django
    django.setup()
    ## write code to test
