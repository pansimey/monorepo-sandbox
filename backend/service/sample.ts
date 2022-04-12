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
      type: ResultType.FAILURE,
      value: new BusinessError('invalid id'),
    };
  }
  return {
    type: ResultType.SUCCESS,
    value: { id: aCommand.id },
  };
};
