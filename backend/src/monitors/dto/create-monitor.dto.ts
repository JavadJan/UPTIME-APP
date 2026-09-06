export class CreateMonitorDto {
  name: string;
  url: string;
  intervalSecs?: number;
  timeoutMs?: number;
}
