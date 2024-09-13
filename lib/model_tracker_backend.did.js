export const idlFactory = ({ IDL }) => {
  const Model = IDL.Record({
    'provider' : IDL.Text,
    'link' : IDL.Text,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'version' : IDL.Text,
    'primary_use_case' : IDL.Text,
    'model_uid' : IDL.Text,
    'image' : IDL.Text,
  });
  const ModelUsage = IDL.Record({
    'usageRecords' : IDL.Vec(
      IDL.Record({ 'timestamp' : IDL.Text, 'requests' : IDL.Nat })
    ),
    'name' : IDL.Text,
    'model_uid' : IDL.Text,
  });
  return IDL.Service({
    'addModelUsages' : IDL.Func(
        [
          IDL.Vec(
            IDL.Record({
              'name' : IDL.Text,
              'timestamp' : IDL.Text,
              'model_uid' : IDL.Text,
              'requests' : IDL.Nat,
            })
          ),
        ],
        [IDL.Text],
        [],
      ),
    'addModels' : IDL.Func([IDL.Vec(Model)], [IDL.Text], []),
    'getModelUsage' : IDL.Func([], [IDL.Vec(ModelUsage)], ['query']),
    'getModels' : IDL.Func([], [IDL.Vec(Model)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
