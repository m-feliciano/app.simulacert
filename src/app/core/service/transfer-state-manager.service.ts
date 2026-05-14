import {inject, Injectable, makeStateKey, TransferState} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransferStateManagerService {
  private readonly transferState = inject(TransferState);

  set<T>(key: string, value: T): void {
    this.transferState.set(makeStateKey<any>(key), {
      value
    });
  }

  get<T>(key: string): T | null {
    const stateKey = makeStateKey<any>(key);
    const cached = this.transferState.get<{ value: T; } | null>(
      stateKey,
      null
    );

    if (!cached) {
      return null;
    }

    this.transferState.remove(stateKey);
    return cached.value;
  }

  remove(key: string): void {
    this.transferState.remove(makeStateKey(key));
  }
}
