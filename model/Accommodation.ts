import { Model } from "@nozbe/watermelondb";
import { field, relation, date } from "@nozbe/watermelondb/decorators";

export default class Accommodation extends Model {
  static table = "accommodations";
  static associations = {
    stops: { type: "belongs_to", key: "stop_id" },
  };

  @field("name") name!: string;
  @field("price") price!: number;
  @field("currency") currency!: string;
  @field("check_in") checkIn!: string;
  @field("check_out") checkOut!: string;
  @field("stop_id") stopId!: string;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("stops", "stop_id") stop!: any;
}
