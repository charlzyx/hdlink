#!/bin/bash

rm -rf z
mkdir -p z
cd z
# 创建M1-M10文件夹
for i in {1..3}; do
    m_folder="M$(printf "%02d" $i)"
    mkdir -p "$m_folder"

    # 在每个M文件夹下创建S01-S03文件夹
    for j in {1..2}; do
        s_folder="$m_folder/S$(printf "%02d" $j)"
        mkdir -p "$s_folder"

        # 在每个S文件夹下创建S01E01-S03E11文件
        for k in {1..3}; do
            episode="$s_folder/S$(printf "%02d" $j)E$(printf "%02d" $k).txt"
            touch "$episode"
        done
    done
done
