export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public messageEn?: string,
    public details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(msg = 'ข้อมูลไม่ถูกต้อง', details?: ApiError['details']) {
    return new ApiError(400, 'VALIDATION_ERROR', msg, 'Validation failed', details);
  }
  static unauthorized(msg = 'กรุณาเข้าสู่ระบบ') {
    return new ApiError(401, 'UNAUTHORIZED', msg, 'Unauthorized');
  }
  static forbidden(msg = 'คุณไม่มีสิทธิ์ดำเนินการนี้') {
    return new ApiError(403, 'FORBIDDEN', msg, 'Forbidden');
  }
  static notFound(msg = 'ไม่พบข้อมูลที่ต้องการ') {
    return new ApiError(404, 'NOT_FOUND', msg, 'Not found');
  }
  static conflict(code: string, msg: string) {
    return new ApiError(409, code, msg, 'Conflict');
  }
  static unprocessable(code: string, msg: string) {
    return new ApiError(422, code, msg, 'Unprocessable');
  }
}
