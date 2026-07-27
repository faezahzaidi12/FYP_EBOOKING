{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
  };

  packages = [
    pkgs.nodePackages.npm # Explicitly include npm for clarity, though nodejs_22 includes it
  ];

  processes = {
    install = {
      exec = "npm install";
    };
    dev = {
      exec = "PORT=$DEV_SERVER_PORT npm run dev";
      process-compose = {
        depends_on = {
          install = {
            condition = "process_completed";
          };
        };
      };
    };
  };
}