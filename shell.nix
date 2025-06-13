let inherit (import <nixpkgs> {}) fetchFromGitHub mkShellNoCC cacert git; in

let fetchNixpkgs =
  { rev, sha256 ? "" }: import (fetchFromGitHub { owner = "NixOS"; repo = "nixpkgs"; inherit rev sha256; }) {}; in

let inherit (fetchNixpkgs {
  rev = "1965fd20a39c8e441746bee66d550af78f0c0a7b"; # 24.11 2025/06/13
  sha256 = "gaWJEWGBW/g1u6o5IM4Un0vluv86cigLuBnjsKILffc=";
}) nodejs_22 pnpm_10; in

mkShellNoCC { packages = [ cacert git nodejs_22 pnpm_10 ]; }
