import config from '@app/ormconfig';

const ormseedconfig = {
  ...config,
  migrations: [__dirname + '/seeds/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/seeds',
  },
};

export default ormseedconfig;
