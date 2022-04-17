import { isFailure, isSuccess } from '@libs/sup';
import { InvalidUserId } from '../business-error/invalid-user-id';
import { UserNotFound } from '../business-error/user-not-found';
import { User } from '../entity/user';
import { applicationService, ShowUserResult } from './show-user';

const dummyUser: User = {
  userId: 'Dummy User',
};

describe('ユースケース：ユーザー情報を表示する', () => {
  const userOfId = jest.fn();
  let result: ShowUserResult;

  describe('正常系', () => {
    beforeEach(async () => {
      userOfId.mockReset();
      userOfId.mockResolvedValue(dummyUser);
      const serviceOutput = applicationService({
        userOfId,
      });
      result = await serviceOutput({ userId: 'Dummy User' });
    });

    test('結果が成功であること', () => {
      expect(isSuccess(result)).toStrictEqual(true);
    });

    test('結果の値としてユーザー情報が返却されること', () => {
      if (isFailure(result)) {
        throw new Error();
      }
      expect(result.resultValue.userId).toStrictEqual('Dummy User');
    });

    test('userOfIdがコールされること', () => {
      expect(userOfId).toBeCalledWith('Dummy User');
    });
  });

  describe('準正常系：正しいユーザーIDが渡されなかった場合', () => {
    beforeEach(async () => {
      userOfId.mockReset();
      userOfId.mockResolvedValue(dummyUser);
      const serviceOutput = applicationService({
        userOfId,
      });
      result = await serviceOutput({ userId: '' });
    });

    test('結果が失敗であること', () => {
      expect(isFailure(result)).toStrictEqual(true);
    });

    test('結果の値としてInvalidUserIdオブジェクトが返却されること', () => {
      if (isSuccess(result)) {
        throw new Error();
      }
      expect(result.resultValue).toBeInstanceOf(InvalidUserId);
    });

    test('userOfIdがコールされないこと', () => {
      expect(userOfId).not.toBeCalled();
    });
  });

  describe('準正常系：ユーザー情報が存在しない場合', () => {
    beforeEach(async () => {
      userOfId.mockReset();
      userOfId.mockResolvedValue(undefined);
      const serviceOutput = applicationService({
        userOfId,
      });
      result = await serviceOutput({ userId: 'Dummy User' });
    });

    test('結果が失敗であること', () => {
      expect(isFailure(result)).toStrictEqual(true);
    });

    test('結果の値としてUserNotFoundオブジェクトが返却されること', () => {
      if (isSuccess(result)) {
        throw new Error();
      }
      expect(result.resultValue).toBeInstanceOf(UserNotFound);
    });

    test('userOfIdがコールされること', () => {
      expect(userOfId).toBeCalledWith('Dummy User');
    });
  });

  describe('異常系：userOfIdが異常終了した場合', () => {
    test('異常終了すること', async () => {
      userOfId.mockReset();
      userOfId.mockRejectedValue(new Error());
      const serviceOutput = applicationService({
        userOfId,
      });
      await expect(serviceOutput({ userId: 'Dummy User' })).rejects.toThrow();
    });
  });
});
