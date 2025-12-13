import { StorageErrorMessagesConsts } from '@/core/consts/storage.consts';
import { UseCaseError } from '@/core/errors/use-case.error';

export class SendToStorageError extends Error implements UseCaseError {
  constructor() {
    super(StorageErrorMessagesConsts.SAVE_TO_STORAGE_ERROR);
  }
}
