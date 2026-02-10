import { Model } from "@nozbe/watermelondb";
import { field, children, date } from "@nozbe/watermelondb/decorators";

export default class Trip extends Model {
  static table = "trips";
  static associations = {
    stops: { type: "has_many", foreignKey: "trip_id" },
  };

  @field("name") name!: string;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @children("stops") stops!: any;
}
