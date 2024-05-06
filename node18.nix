# Minimal Supported Nodejs Version Environment
{ pkgs ? import <nixpkgs> {} }:
  pkgs.mkShell {
    nativeBuildInputs = with pkgs; [
      nodejs-18_x
      yarn
    ];
}
