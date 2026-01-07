import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

export async function getSourceFn(source: string): Promise<> {
const http = inject(HttpClient);
}
