#!/bin/bash

# SmartShop AI - Quick Update Script
echo "🚀 SmartShop AI güncelleniyor..."

# Değişiklikleri ekle
git add .

# Commit mesajı al
if [ "$1" != "" ]; then
    commit_message="$1"
else
    commit_message="🔄 SmartShop AI güncellendi - $(date '+%Y-%m-%d %H:%M')"
fi

# Commit yap
git commit -m "$commit_message"

# GitHub'a gönder
git push

echo "✅ Güncelleme tamamlandı!"
echo "🌐 Site: https://nesquaeke.github.io/SmartShop-AI/" 