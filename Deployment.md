Workflow for deployment of this website on Hostinger VPS

Step 1 - Ask me for the commit name.
Step 2 - Once you have the commit name. in the project root run git add .
Step 3 - Then run git commit -m "Commit Name"
Step 4 - Then run git push origin main
Step 5 - Open normal terminal and connect to the hostinger vps using ssh and paraphrase. SSH - ssh root@31.97.202.88
Step 6 - Enter paraphrase - superchat9897
Step 7 - Once you are inside the VPS go to this location cd /var/www/paradise-yatra-main-site
Step 8 - Run git pull origin main
Step 9 - go to this folder cd /var/www/paradise-yatra-main-site/paradise-yatra-backend-master
Step 10 - then run npm install
Step 11 - If any vulnerabilities come then run npm audit fix (if no vulnerabilities then skip this step)
Step 12 - If vulnerabilities still exist after running npm audit fix then run npm audit fix --force (if no vulnerabilities then skip this step)
Step 13 - Then run cd .. to get our of the backend folder
Step 14 - Then go to this folder cd /var/www/paradise-yatra-main-site/ParadiseYatra-3f9e3de458766b6e46e903f1eef6ab5af5200888
Step 15 - then run npm install
Step 16 - If any vulnerabilities come then run npm audit fix (if no vulnerabilities then skip this step)
Step 17 - If vulnerabilities still exist after running npm audit fix then run npm audit fix --force (if no vulnerabilities then skip this step)
Step 18 - then run npm run build
Step 19 - Once build is complete and successful. run pm2 list
Step 20 - then run pm2 restart 0
Step 21 - then run pm2 restart 1
Step 22 - then run pm2 save

Note - If you encounter any issues or situation that is not mentioned in the above workflow then you will not proceed or do anything to trouble shoot it. You will directly report that to me.