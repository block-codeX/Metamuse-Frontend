current_datetime=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
filename="server_${current_datetime}.tar.gz"
cd "$HOME/Desktop/projects/Metamuse-Frontend"
rm -rf server*.gz
tar --exclude-from=.tarignore  -czvf "$filename" . || echo "tar command failed"
scp $filename metamuse:~/Metamuse-Frontend/"$filename"
# scp requirements.txt metamuse:~/Playzone/requirements.txt
ssh metamuse << EOF
 echo "Installing dependencies"
 
# sudo apt install nginx
  # Unzip the contents to a folder called "server" in ~/
  echo "Unzipping to server folder"
    tar -xzvf ~/Metamuse-Frontend/"$filename" -C ~/Metamuse-Frontend --strip-components=1
    cd ~/Metamuse-Frontend/metamuse
    # echo "Reloading systemd..."
    sudo systemctl daemon-reload
    # echo "Enabling service..."
    sudo systemctl enable frontend
    # echo "Service complete!"
    # echo "Installing npm requirements"
     pnpm install
    # echo "Building the project"
    pnpm run build
    # echo "Restarting service..."
    sudo service frontend restart

  echo "Remote operations completed successfully"
EOF
