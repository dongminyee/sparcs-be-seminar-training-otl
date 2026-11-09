import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { resourceIdSchema } from "@mini-otl/contracts";

@Injectable()
export class ResourceIdPipe implements PipeTransform<string, number> {
  transform(value: string) {
    const id = resourceIdSchema.safeParse(Number(value));
    if (!/^\d+$/.test(value) || !id.success) {
      throw new BadRequestException("유효한 ID를 입력해 주세요.");
    }
    return id.data;
  }
}
