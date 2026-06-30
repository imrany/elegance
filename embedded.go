package elegance

import "embed"

//go:embed migrations/*
var MigrationsFS embed.FS

//go:embed dist/*
var DistFS embed.FS
