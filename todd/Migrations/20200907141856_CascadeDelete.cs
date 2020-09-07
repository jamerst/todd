using Microsoft.EntityFrameworkCore.Migrations;

namespace todd.Migrations
{
    public partial class CascadeDelete : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_Items_ItemId",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Records_Items_ItemId",
                table: "Records");

            migrationBuilder.AlterColumn<string>(
                name: "ItemId",
                table: "Records",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ItemId",
                table: "Images",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Items_ItemId",
                table: "Images",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Records_Items_ItemId",
                table: "Records",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_Items_ItemId",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Records_Items_ItemId",
                table: "Records");

            migrationBuilder.AlterColumn<string>(
                name: "ItemId",
                table: "Records",
                type: "text",
                nullable: true,
                oldClrType: typeof(string));

            migrationBuilder.AlterColumn<string>(
                name: "ItemId",
                table: "Images",
                type: "text",
                nullable: true,
                oldClrType: typeof(string));

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Items_ItemId",
                table: "Images",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Records_Items_ItemId",
                table: "Records",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
