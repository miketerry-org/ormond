#!/usr/bin/env node

"use strict";

import { cli } from "./lib/cli.js";

// Remove the first two args (node + script path)
cli(process.argv.slice(2));
