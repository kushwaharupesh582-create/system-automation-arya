from pathlib import Path
from windows_toasts import (
    InteractableWindowsToaster,
    Toast,
    ToastDisplayImage,
    ToastImagePosition,
)

toaster = InteractableWindowsToaster('ARYA')

toast = Toast(text_fields=['Battery Low', 'Charger lagao sir!'])

# Sahi tarika — fromPath() use karo
toast.AddImage(ToastDisplayImage.fromPath(
    'C:/Users/kushw/ARYA_AI/static/arya_dark1.png',
    position=ToastImagePosition.Hero
))

toaster.show_toast(toast)
print('Bhej diya!')