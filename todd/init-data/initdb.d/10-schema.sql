CREATE TABLE "Locations" (
    "Id" text NOT NULL,
    "Name" text NULL,
    CONSTRAINT "PK_Locations" PRIMARY KEY ("Id")
);

CREATE TABLE "Settings" (
    "Key" text NOT NULL,
    "Value" text NULL,
    CONSTRAINT "PK_Settings" PRIMARY KEY ("Key")
);

CREATE TABLE "Users" (
    "Id" text NOT NULL,
    "Username" text NULL,
    "Password" text NULL,
    "Salt" text NULL,
    "HashSize" integer NOT NULL,
    "HashIterations" integer NOT NULL,
    "SaltSize" integer NOT NULL,
    "Admin" boolean NOT NULL,
    "Active" boolean NOT NULL,
    "Reset" text NULL,
    "ResetGenerated" timestamp without time zone NOT NULL,
    "Activation" text NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

CREATE TABLE "Items" (
    "Id" text NOT NULL,
    "Name" text NULL,
    "Type" smallint NOT NULL,
    "Description" text NULL,
    "LocationId" text NULL,
    "Quantity" integer NOT NULL,
    "CreatorId" text NULL,
    "Created" timestamp without time zone NOT NULL,
    CONSTRAINT "PK_Items" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Items_Users_CreatorId" FOREIGN KEY ("CreatorId") REFERENCES "Users" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Items_Locations_LocationId" FOREIGN KEY ("LocationId") REFERENCES "Locations" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "RefreshTokens" (
    "Token" text NOT NULL,
    "UserId" text NOT NULL,
    "Generated" timestamp without time zone NOT NULL,
    CONSTRAINT "PK_RefreshTokens" PRIMARY KEY ("Token"),
    CONSTRAINT "FK_RefreshTokens_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Images" (
    "Id" text NOT NULL,
    "Path" text NULL,
    "ItemId" text NOT NULL,
    CONSTRAINT "PK_Images" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Images_Items_ItemId" FOREIGN KEY ("ItemId") REFERENCES "Items" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Records" (
    "Id" text NOT NULL,
    "ItemId" text NOT NULL,
    "UserId" text NULL,
    "Type" smallint NOT NULL,
    "Description" text NULL,
    "Date" timestamp without time zone NOT NULL,
    CONSTRAINT "PK_Records" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Records_Items_ItemId" FOREIGN KEY ("ItemId") REFERENCES "Items" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Records_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

CREATE INDEX "IX_Images_ItemId" ON "Images" ("ItemId");

CREATE INDEX "IX_Items_CreatorId" ON "Items" ("CreatorId");

CREATE INDEX "IX_Items_LocationId" ON "Items" ("LocationId");

CREATE INDEX "IX_Records_ItemId" ON "Records" ("ItemId");

CREATE INDEX "IX_Records_UserId" ON "Records" ("UserId");

CREATE INDEX "IX_RefreshTokens_UserId" ON "RefreshTokens" ("UserId");

