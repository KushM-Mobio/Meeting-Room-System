## Calendar App
  simple calendar app using frappe + react

## Requirements
  Frappe.

## Installation
1. Install and setup bench by following [this guide](https://frappeframework.com/docs/v14/user/en/installation)
2. In the bench directory, run `bench start` and keep it running
3. Open another terminal in bench directory, and run these commands
   
    `bench get-app https://github.com/KushM-Mobio/Meeting-Room-System.git`
   
    `bench new-site calendar.com`
   
    `bench --site calendar.com install-app calendar_app`
   
    `bench use calendar.com`

    `bench --site calendar.com migrate`
   
5. Some chnages in `common_site_config.json` and `site_config.json`
   1. `site_config.json`
      add "developer_mode": 1
      
   2. `common_site_config.json`
      add "allow_cors": "*",
          "ignore_csrf": 1
   3. also change your access token for api calls. and you can generate your access token from frappe desk.
      
6. You can also run a development server for frontend using these commands
     `npm run dev` or `yarn dev`
   
#### License

MIT# Meeting-Room-App
