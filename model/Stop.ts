import { Model } from "@nozbe/watermelondb";
import {
  field,
  relation,
  children,
  date,
} from "@nozbe/watermelondb/decorators";

export default class Stop extends Model {
  static table = "stops";
  static associations = {
    trips: { type: "belongs_to", key: "trip_id" },
    accommodations: { type: "has_many", foreignKey: "stop_id" },
    transports: { type: "has_many", foreignKey: "stop_id" },
  };

  @field("name") name!: string;
  @field("date") date!: string;
  @field("trip_id") tripId!: string;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;

  @relation("trips", "trip_id") trip!: any;
  @children("accommodations") accommodations!: any;
  @children("transports") transports!: any;
}
