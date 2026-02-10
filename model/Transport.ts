import { Model } from "@nozbe/watermelondb";
import { field, relation, date } from "@nozbe/watermelondb/decorators";

export default class Transport extends Model {
  static table = "transports";
  static associations = {
    stops: { type: "belongs_to", key: "stop_id" },
  };

  @field("name") name!: string;
  @field("type") type!: string;
  @field("price") price!: number;
  @field("currency") currency!: string;
  @field("date") date!: string;
  @field("stop_id") stopId!: string;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("stops", "stop_id") stop!: any;
}
