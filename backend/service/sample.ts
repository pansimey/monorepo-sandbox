import { ApplicationService, BusinessError, ResultType } from '@libs/sup';

export interface ACommand {
  id: number;
}

export interface AnOutput {
  id: number;
}

type Registry = void;

export const applicationService: ApplicationService<
  Registry,
  ACommand,
  BusinessError,
  AnOutput
> = () => async (aCommand) => {
  await Promise.resolve();
  if (Number.isNaN(aCommand.id)) {
    return {
      resultType: ResultType.FAILURE,
      resultValue: new BusinessError('invalid id'),
    };
  }
  return {
    resultType: ResultType.SUCCESS,
    resultValue: { id: aCommand.id },
  };
};
