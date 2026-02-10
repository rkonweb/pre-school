
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model TrainingCategory
 * 
 */
export type TrainingCategory = $Result.DefaultSelection<Prisma.$TrainingCategoryPayload>
/**
 * Model TrainingModule
 * 
 */
export type TrainingModule = $Result.DefaultSelection<Prisma.$TrainingModulePayload>
/**
 * Model TrainingTopic
 * 
 */
export type TrainingTopic = $Result.DefaultSelection<Prisma.$TrainingTopicPayload>
/**
 * Model TrainingPage
 * 
 */
export type TrainingPage = $Result.DefaultSelection<Prisma.$TrainingPagePayload>
/**
 * Model TrainingAttachment
 * 
 */
export type TrainingAttachment = $Result.DefaultSelection<Prisma.$TrainingAttachmentPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more TrainingCategories
 * const trainingCategories = await prisma.trainingCategory.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more TrainingCategories
   * const trainingCategories = await prisma.trainingCategory.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.trainingCategory`: Exposes CRUD operations for the **TrainingCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrainingCategories
    * const trainingCategories = await prisma.trainingCategory.findMany()
    * ```
    */
  get trainingCategory(): Prisma.TrainingCategoryDelegate<ExtArgs>;

  /**
   * `prisma.trainingModule`: Exposes CRUD operations for the **TrainingModule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrainingModules
    * const trainingModules = await prisma.trainingModule.findMany()
    * ```
    */
  get trainingModule(): Prisma.TrainingModuleDelegate<ExtArgs>;

  /**
   * `prisma.trainingTopic`: Exposes CRUD operations for the **TrainingTopic** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrainingTopics
    * const trainingTopics = await prisma.trainingTopic.findMany()
    * ```
    */
  get trainingTopic(): Prisma.TrainingTopicDelegate<ExtArgs>;

  /**
   * `prisma.trainingPage`: Exposes CRUD operations for the **TrainingPage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrainingPages
    * const trainingPages = await prisma.trainingPage.findMany()
    * ```
    */
  get trainingPage(): Prisma.TrainingPageDelegate<ExtArgs>;

  /**
   * `prisma.trainingAttachment`: Exposes CRUD operations for the **TrainingAttachment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrainingAttachments
    * const trainingAttachments = await prisma.trainingAttachment.findMany()
    * ```
    */
  get trainingAttachment(): Prisma.TrainingAttachmentDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    TrainingCategory: 'TrainingCategory',
    TrainingModule: 'TrainingModule',
    TrainingTopic: 'TrainingTopic',
    TrainingPage: 'TrainingPage',
    TrainingAttachment: 'TrainingAttachment'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "trainingCategory" | "trainingModule" | "trainingTopic" | "trainingPage" | "trainingAttachment"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      TrainingCategory: {
        payload: Prisma.$TrainingCategoryPayload<ExtArgs>
        fields: Prisma.TrainingCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrainingCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrainingCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingCategoryPayload>
          }
          findFirst: {
            args: Prisma.TrainingCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrainingCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingCategoryPayload>
          }
          findMany: {
            args: Prisma.TrainingCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingCategoryPayload>[]
          }
          create: {
            args: Prisma.TrainingCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingCategoryPayload>
          }
          createMany: {
            args: Prisma.TrainingCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrainingCategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingCategoryPayload>[]
          }
          delete: {
            args: Prisma.TrainingCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingCategoryPayload>
          }
          update: {
            args: Prisma.TrainingCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingCategoryPayload>
          }
          deleteMany: {
            args: Prisma.TrainingCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrainingCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TrainingCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingCategoryPayload>
          }
          aggregate: {
            args: Prisma.TrainingCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrainingCategory>
          }
          groupBy: {
            args: Prisma.TrainingCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrainingCategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrainingCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<TrainingCategoryCountAggregateOutputType> | number
          }
        }
      }
      TrainingModule: {
        payload: Prisma.$TrainingModulePayload<ExtArgs>
        fields: Prisma.TrainingModuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrainingModuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingModulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrainingModuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingModulePayload>
          }
          findFirst: {
            args: Prisma.TrainingModuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingModulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrainingModuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingModulePayload>
          }
          findMany: {
            args: Prisma.TrainingModuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingModulePayload>[]
          }
          create: {
            args: Prisma.TrainingModuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingModulePayload>
          }
          createMany: {
            args: Prisma.TrainingModuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrainingModuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingModulePayload>[]
          }
          delete: {
            args: Prisma.TrainingModuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingModulePayload>
          }
          update: {
            args: Prisma.TrainingModuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingModulePayload>
          }
          deleteMany: {
            args: Prisma.TrainingModuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrainingModuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TrainingModuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingModulePayload>
          }
          aggregate: {
            args: Prisma.TrainingModuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrainingModule>
          }
          groupBy: {
            args: Prisma.TrainingModuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrainingModuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrainingModuleCountArgs<ExtArgs>
            result: $Utils.Optional<TrainingModuleCountAggregateOutputType> | number
          }
        }
      }
      TrainingTopic: {
        payload: Prisma.$TrainingTopicPayload<ExtArgs>
        fields: Prisma.TrainingTopicFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrainingTopicFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingTopicPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrainingTopicFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingTopicPayload>
          }
          findFirst: {
            args: Prisma.TrainingTopicFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingTopicPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrainingTopicFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingTopicPayload>
          }
          findMany: {
            args: Prisma.TrainingTopicFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingTopicPayload>[]
          }
          create: {
            args: Prisma.TrainingTopicCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingTopicPayload>
          }
          createMany: {
            args: Prisma.TrainingTopicCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrainingTopicCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingTopicPayload>[]
          }
          delete: {
            args: Prisma.TrainingTopicDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingTopicPayload>
          }
          update: {
            args: Prisma.TrainingTopicUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingTopicPayload>
          }
          deleteMany: {
            args: Prisma.TrainingTopicDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrainingTopicUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TrainingTopicUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingTopicPayload>
          }
          aggregate: {
            args: Prisma.TrainingTopicAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrainingTopic>
          }
          groupBy: {
            args: Prisma.TrainingTopicGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrainingTopicGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrainingTopicCountArgs<ExtArgs>
            result: $Utils.Optional<TrainingTopicCountAggregateOutputType> | number
          }
        }
      }
      TrainingPage: {
        payload: Prisma.$TrainingPagePayload<ExtArgs>
        fields: Prisma.TrainingPageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrainingPageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingPagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrainingPageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingPagePayload>
          }
          findFirst: {
            args: Prisma.TrainingPageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingPagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrainingPageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingPagePayload>
          }
          findMany: {
            args: Prisma.TrainingPageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingPagePayload>[]
          }
          create: {
            args: Prisma.TrainingPageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingPagePayload>
          }
          createMany: {
            args: Prisma.TrainingPageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrainingPageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingPagePayload>[]
          }
          delete: {
            args: Prisma.TrainingPageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingPagePayload>
          }
          update: {
            args: Prisma.TrainingPageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingPagePayload>
          }
          deleteMany: {
            args: Prisma.TrainingPageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrainingPageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TrainingPageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingPagePayload>
          }
          aggregate: {
            args: Prisma.TrainingPageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrainingPage>
          }
          groupBy: {
            args: Prisma.TrainingPageGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrainingPageGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrainingPageCountArgs<ExtArgs>
            result: $Utils.Optional<TrainingPageCountAggregateOutputType> | number
          }
        }
      }
      TrainingAttachment: {
        payload: Prisma.$TrainingAttachmentPayload<ExtArgs>
        fields: Prisma.TrainingAttachmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrainingAttachmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAttachmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrainingAttachmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAttachmentPayload>
          }
          findFirst: {
            args: Prisma.TrainingAttachmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAttachmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrainingAttachmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAttachmentPayload>
          }
          findMany: {
            args: Prisma.TrainingAttachmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAttachmentPayload>[]
          }
          create: {
            args: Prisma.TrainingAttachmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAttachmentPayload>
          }
          createMany: {
            args: Prisma.TrainingAttachmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrainingAttachmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAttachmentPayload>[]
          }
          delete: {
            args: Prisma.TrainingAttachmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAttachmentPayload>
          }
          update: {
            args: Prisma.TrainingAttachmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAttachmentPayload>
          }
          deleteMany: {
            args: Prisma.TrainingAttachmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrainingAttachmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TrainingAttachmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAttachmentPayload>
          }
          aggregate: {
            args: Prisma.TrainingAttachmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrainingAttachment>
          }
          groupBy: {
            args: Prisma.TrainingAttachmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrainingAttachmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrainingAttachmentCountArgs<ExtArgs>
            result: $Utils.Optional<TrainingAttachmentCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TrainingCategoryCountOutputType
   */

  export type TrainingCategoryCountOutputType = {
    modules: number
  }

  export type TrainingCategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    modules?: boolean | TrainingCategoryCountOutputTypeCountModulesArgs
  }

  // Custom InputTypes
  /**
   * TrainingCategoryCountOutputType without action
   */
  export type TrainingCategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategoryCountOutputType
     */
    select?: TrainingCategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TrainingCategoryCountOutputType without action
   */
  export type TrainingCategoryCountOutputTypeCountModulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingModuleWhereInput
  }


  /**
   * Count Type TrainingModuleCountOutputType
   */

  export type TrainingModuleCountOutputType = {
    topics: number
  }

  export type TrainingModuleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    topics?: boolean | TrainingModuleCountOutputTypeCountTopicsArgs
  }

  // Custom InputTypes
  /**
   * TrainingModuleCountOutputType without action
   */
  export type TrainingModuleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModuleCountOutputType
     */
    select?: TrainingModuleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TrainingModuleCountOutputType without action
   */
  export type TrainingModuleCountOutputTypeCountTopicsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingTopicWhereInput
  }


  /**
   * Count Type TrainingTopicCountOutputType
   */

  export type TrainingTopicCountOutputType = {
    pages: number
  }

  export type TrainingTopicCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pages?: boolean | TrainingTopicCountOutputTypeCountPagesArgs
  }

  // Custom InputTypes
  /**
   * TrainingTopicCountOutputType without action
   */
  export type TrainingTopicCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopicCountOutputType
     */
    select?: TrainingTopicCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TrainingTopicCountOutputType without action
   */
  export type TrainingTopicCountOutputTypeCountPagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingPageWhereInput
  }


  /**
   * Count Type TrainingPageCountOutputType
   */

  export type TrainingPageCountOutputType = {
    attachments: number
  }

  export type TrainingPageCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attachments?: boolean | TrainingPageCountOutputTypeCountAttachmentsArgs
  }

  // Custom InputTypes
  /**
   * TrainingPageCountOutputType without action
   */
  export type TrainingPageCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPageCountOutputType
     */
    select?: TrainingPageCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TrainingPageCountOutputType without action
   */
  export type TrainingPageCountOutputTypeCountAttachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingAttachmentWhereInput
  }


  /**
   * Models
   */

  /**
   * Model TrainingCategory
   */

  export type AggregateTrainingCategory = {
    _count: TrainingCategoryCountAggregateOutputType | null
    _min: TrainingCategoryMinAggregateOutputType | null
    _max: TrainingCategoryMaxAggregateOutputType | null
  }

  export type TrainingCategoryMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrainingCategoryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrainingCategoryCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    description: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TrainingCategoryMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrainingCategoryMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrainingCategoryCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TrainingCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingCategory to aggregate.
     */
    where?: TrainingCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingCategories to fetch.
     */
    orderBy?: TrainingCategoryOrderByWithRelationInput | TrainingCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrainingCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrainingCategories
    **/
    _count?: true | TrainingCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrainingCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrainingCategoryMaxAggregateInputType
  }

  export type GetTrainingCategoryAggregateType<T extends TrainingCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateTrainingCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrainingCategory[P]>
      : GetScalarType<T[P], AggregateTrainingCategory[P]>
  }




  export type TrainingCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingCategoryWhereInput
    orderBy?: TrainingCategoryOrderByWithAggregationInput | TrainingCategoryOrderByWithAggregationInput[]
    by: TrainingCategoryScalarFieldEnum[] | TrainingCategoryScalarFieldEnum
    having?: TrainingCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrainingCategoryCountAggregateInputType | true
    _min?: TrainingCategoryMinAggregateInputType
    _max?: TrainingCategoryMaxAggregateInputType
  }

  export type TrainingCategoryGroupByOutputType = {
    id: string
    name: string
    slug: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    _count: TrainingCategoryCountAggregateOutputType | null
    _min: TrainingCategoryMinAggregateOutputType | null
    _max: TrainingCategoryMaxAggregateOutputType | null
  }

  type GetTrainingCategoryGroupByPayload<T extends TrainingCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrainingCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrainingCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrainingCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], TrainingCategoryGroupByOutputType[P]>
        }
      >
    >


  export type TrainingCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    modules?: boolean | TrainingCategory$modulesArgs<ExtArgs>
    _count?: boolean | TrainingCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trainingCategory"]>

  export type TrainingCategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["trainingCategory"]>

  export type TrainingCategorySelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TrainingCategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    modules?: boolean | TrainingCategory$modulesArgs<ExtArgs>
    _count?: boolean | TrainingCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TrainingCategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TrainingCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrainingCategory"
    objects: {
      modules: Prisma.$TrainingModulePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      description: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["trainingCategory"]>
    composites: {}
  }

  type TrainingCategoryGetPayload<S extends boolean | null | undefined | TrainingCategoryDefaultArgs> = $Result.GetResult<Prisma.$TrainingCategoryPayload, S>

  type TrainingCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TrainingCategoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TrainingCategoryCountAggregateInputType | true
    }

  export interface TrainingCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrainingCategory'], meta: { name: 'TrainingCategory' } }
    /**
     * Find zero or one TrainingCategory that matches the filter.
     * @param {TrainingCategoryFindUniqueArgs} args - Arguments to find a TrainingCategory
     * @example
     * // Get one TrainingCategory
     * const trainingCategory = await prisma.trainingCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrainingCategoryFindUniqueArgs>(args: SelectSubset<T, TrainingCategoryFindUniqueArgs<ExtArgs>>): Prisma__TrainingCategoryClient<$Result.GetResult<Prisma.$TrainingCategoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TrainingCategory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TrainingCategoryFindUniqueOrThrowArgs} args - Arguments to find a TrainingCategory
     * @example
     * // Get one TrainingCategory
     * const trainingCategory = await prisma.trainingCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrainingCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, TrainingCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrainingCategoryClient<$Result.GetResult<Prisma.$TrainingCategoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TrainingCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingCategoryFindFirstArgs} args - Arguments to find a TrainingCategory
     * @example
     * // Get one TrainingCategory
     * const trainingCategory = await prisma.trainingCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrainingCategoryFindFirstArgs>(args?: SelectSubset<T, TrainingCategoryFindFirstArgs<ExtArgs>>): Prisma__TrainingCategoryClient<$Result.GetResult<Prisma.$TrainingCategoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TrainingCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingCategoryFindFirstOrThrowArgs} args - Arguments to find a TrainingCategory
     * @example
     * // Get one TrainingCategory
     * const trainingCategory = await prisma.trainingCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrainingCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, TrainingCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrainingCategoryClient<$Result.GetResult<Prisma.$TrainingCategoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TrainingCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrainingCategories
     * const trainingCategories = await prisma.trainingCategory.findMany()
     * 
     * // Get first 10 TrainingCategories
     * const trainingCategories = await prisma.trainingCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trainingCategoryWithIdOnly = await prisma.trainingCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TrainingCategoryFindManyArgs>(args?: SelectSubset<T, TrainingCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingCategoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TrainingCategory.
     * @param {TrainingCategoryCreateArgs} args - Arguments to create a TrainingCategory.
     * @example
     * // Create one TrainingCategory
     * const TrainingCategory = await prisma.trainingCategory.create({
     *   data: {
     *     // ... data to create a TrainingCategory
     *   }
     * })
     * 
     */
    create<T extends TrainingCategoryCreateArgs>(args: SelectSubset<T, TrainingCategoryCreateArgs<ExtArgs>>): Prisma__TrainingCategoryClient<$Result.GetResult<Prisma.$TrainingCategoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TrainingCategories.
     * @param {TrainingCategoryCreateManyArgs} args - Arguments to create many TrainingCategories.
     * @example
     * // Create many TrainingCategories
     * const trainingCategory = await prisma.trainingCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrainingCategoryCreateManyArgs>(args?: SelectSubset<T, TrainingCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TrainingCategories and returns the data saved in the database.
     * @param {TrainingCategoryCreateManyAndReturnArgs} args - Arguments to create many TrainingCategories.
     * @example
     * // Create many TrainingCategories
     * const trainingCategory = await prisma.trainingCategory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TrainingCategories and only return the `id`
     * const trainingCategoryWithIdOnly = await prisma.trainingCategory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrainingCategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, TrainingCategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingCategoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TrainingCategory.
     * @param {TrainingCategoryDeleteArgs} args - Arguments to delete one TrainingCategory.
     * @example
     * // Delete one TrainingCategory
     * const TrainingCategory = await prisma.trainingCategory.delete({
     *   where: {
     *     // ... filter to delete one TrainingCategory
     *   }
     * })
     * 
     */
    delete<T extends TrainingCategoryDeleteArgs>(args: SelectSubset<T, TrainingCategoryDeleteArgs<ExtArgs>>): Prisma__TrainingCategoryClient<$Result.GetResult<Prisma.$TrainingCategoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TrainingCategory.
     * @param {TrainingCategoryUpdateArgs} args - Arguments to update one TrainingCategory.
     * @example
     * // Update one TrainingCategory
     * const trainingCategory = await prisma.trainingCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrainingCategoryUpdateArgs>(args: SelectSubset<T, TrainingCategoryUpdateArgs<ExtArgs>>): Prisma__TrainingCategoryClient<$Result.GetResult<Prisma.$TrainingCategoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TrainingCategories.
     * @param {TrainingCategoryDeleteManyArgs} args - Arguments to filter TrainingCategories to delete.
     * @example
     * // Delete a few TrainingCategories
     * const { count } = await prisma.trainingCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrainingCategoryDeleteManyArgs>(args?: SelectSubset<T, TrainingCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrainingCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrainingCategories
     * const trainingCategory = await prisma.trainingCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrainingCategoryUpdateManyArgs>(args: SelectSubset<T, TrainingCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TrainingCategory.
     * @param {TrainingCategoryUpsertArgs} args - Arguments to update or create a TrainingCategory.
     * @example
     * // Update or create a TrainingCategory
     * const trainingCategory = await prisma.trainingCategory.upsert({
     *   create: {
     *     // ... data to create a TrainingCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrainingCategory we want to update
     *   }
     * })
     */
    upsert<T extends TrainingCategoryUpsertArgs>(args: SelectSubset<T, TrainingCategoryUpsertArgs<ExtArgs>>): Prisma__TrainingCategoryClient<$Result.GetResult<Prisma.$TrainingCategoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TrainingCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingCategoryCountArgs} args - Arguments to filter TrainingCategories to count.
     * @example
     * // Count the number of TrainingCategories
     * const count = await prisma.trainingCategory.count({
     *   where: {
     *     // ... the filter for the TrainingCategories we want to count
     *   }
     * })
    **/
    count<T extends TrainingCategoryCountArgs>(
      args?: Subset<T, TrainingCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrainingCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrainingCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrainingCategoryAggregateArgs>(args: Subset<T, TrainingCategoryAggregateArgs>): Prisma.PrismaPromise<GetTrainingCategoryAggregateType<T>>

    /**
     * Group by TrainingCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrainingCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrainingCategoryGroupByArgs['orderBy'] }
        : { orderBy?: TrainingCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrainingCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrainingCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrainingCategory model
   */
  readonly fields: TrainingCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrainingCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrainingCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    modules<T extends TrainingCategory$modulesArgs<ExtArgs> = {}>(args?: Subset<T, TrainingCategory$modulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingModulePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TrainingCategory model
   */ 
  interface TrainingCategoryFieldRefs {
    readonly id: FieldRef<"TrainingCategory", 'String'>
    readonly name: FieldRef<"TrainingCategory", 'String'>
    readonly slug: FieldRef<"TrainingCategory", 'String'>
    readonly description: FieldRef<"TrainingCategory", 'String'>
    readonly createdAt: FieldRef<"TrainingCategory", 'DateTime'>
    readonly updatedAt: FieldRef<"TrainingCategory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TrainingCategory findUnique
   */
  export type TrainingCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategory
     */
    select?: TrainingCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingCategoryInclude<ExtArgs> | null
    /**
     * Filter, which TrainingCategory to fetch.
     */
    where: TrainingCategoryWhereUniqueInput
  }

  /**
   * TrainingCategory findUniqueOrThrow
   */
  export type TrainingCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategory
     */
    select?: TrainingCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingCategoryInclude<ExtArgs> | null
    /**
     * Filter, which TrainingCategory to fetch.
     */
    where: TrainingCategoryWhereUniqueInput
  }

  /**
   * TrainingCategory findFirst
   */
  export type TrainingCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategory
     */
    select?: TrainingCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingCategoryInclude<ExtArgs> | null
    /**
     * Filter, which TrainingCategory to fetch.
     */
    where?: TrainingCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingCategories to fetch.
     */
    orderBy?: TrainingCategoryOrderByWithRelationInput | TrainingCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingCategories.
     */
    cursor?: TrainingCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingCategories.
     */
    distinct?: TrainingCategoryScalarFieldEnum | TrainingCategoryScalarFieldEnum[]
  }

  /**
   * TrainingCategory findFirstOrThrow
   */
  export type TrainingCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategory
     */
    select?: TrainingCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingCategoryInclude<ExtArgs> | null
    /**
     * Filter, which TrainingCategory to fetch.
     */
    where?: TrainingCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingCategories to fetch.
     */
    orderBy?: TrainingCategoryOrderByWithRelationInput | TrainingCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingCategories.
     */
    cursor?: TrainingCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingCategories.
     */
    distinct?: TrainingCategoryScalarFieldEnum | TrainingCategoryScalarFieldEnum[]
  }

  /**
   * TrainingCategory findMany
   */
  export type TrainingCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategory
     */
    select?: TrainingCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingCategoryInclude<ExtArgs> | null
    /**
     * Filter, which TrainingCategories to fetch.
     */
    where?: TrainingCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingCategories to fetch.
     */
    orderBy?: TrainingCategoryOrderByWithRelationInput | TrainingCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrainingCategories.
     */
    cursor?: TrainingCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingCategories.
     */
    skip?: number
    distinct?: TrainingCategoryScalarFieldEnum | TrainingCategoryScalarFieldEnum[]
  }

  /**
   * TrainingCategory create
   */
  export type TrainingCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategory
     */
    select?: TrainingCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingCategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a TrainingCategory.
     */
    data: XOR<TrainingCategoryCreateInput, TrainingCategoryUncheckedCreateInput>
  }

  /**
   * TrainingCategory createMany
   */
  export type TrainingCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrainingCategories.
     */
    data: TrainingCategoryCreateManyInput | TrainingCategoryCreateManyInput[]
  }

  /**
   * TrainingCategory createManyAndReturn
   */
  export type TrainingCategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategory
     */
    select?: TrainingCategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TrainingCategories.
     */
    data: TrainingCategoryCreateManyInput | TrainingCategoryCreateManyInput[]
  }

  /**
   * TrainingCategory update
   */
  export type TrainingCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategory
     */
    select?: TrainingCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingCategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a TrainingCategory.
     */
    data: XOR<TrainingCategoryUpdateInput, TrainingCategoryUncheckedUpdateInput>
    /**
     * Choose, which TrainingCategory to update.
     */
    where: TrainingCategoryWhereUniqueInput
  }

  /**
   * TrainingCategory updateMany
   */
  export type TrainingCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrainingCategories.
     */
    data: XOR<TrainingCategoryUpdateManyMutationInput, TrainingCategoryUncheckedUpdateManyInput>
    /**
     * Filter which TrainingCategories to update
     */
    where?: TrainingCategoryWhereInput
  }

  /**
   * TrainingCategory upsert
   */
  export type TrainingCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategory
     */
    select?: TrainingCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingCategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the TrainingCategory to update in case it exists.
     */
    where: TrainingCategoryWhereUniqueInput
    /**
     * In case the TrainingCategory found by the `where` argument doesn't exist, create a new TrainingCategory with this data.
     */
    create: XOR<TrainingCategoryCreateInput, TrainingCategoryUncheckedCreateInput>
    /**
     * In case the TrainingCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrainingCategoryUpdateInput, TrainingCategoryUncheckedUpdateInput>
  }

  /**
   * TrainingCategory delete
   */
  export type TrainingCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategory
     */
    select?: TrainingCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingCategoryInclude<ExtArgs> | null
    /**
     * Filter which TrainingCategory to delete.
     */
    where: TrainingCategoryWhereUniqueInput
  }

  /**
   * TrainingCategory deleteMany
   */
  export type TrainingCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingCategories to delete
     */
    where?: TrainingCategoryWhereInput
  }

  /**
   * TrainingCategory.modules
   */
  export type TrainingCategory$modulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModule
     */
    select?: TrainingModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingModuleInclude<ExtArgs> | null
    where?: TrainingModuleWhereInput
    orderBy?: TrainingModuleOrderByWithRelationInput | TrainingModuleOrderByWithRelationInput[]
    cursor?: TrainingModuleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrainingModuleScalarFieldEnum | TrainingModuleScalarFieldEnum[]
  }

  /**
   * TrainingCategory without action
   */
  export type TrainingCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategory
     */
    select?: TrainingCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingCategoryInclude<ExtArgs> | null
  }


  /**
   * Model TrainingModule
   */

  export type AggregateTrainingModule = {
    _count: TrainingModuleCountAggregateOutputType | null
    _avg: TrainingModuleAvgAggregateOutputType | null
    _sum: TrainingModuleSumAggregateOutputType | null
    _min: TrainingModuleMinAggregateOutputType | null
    _max: TrainingModuleMaxAggregateOutputType | null
  }

  export type TrainingModuleAvgAggregateOutputType = {
    order: number | null
  }

  export type TrainingModuleSumAggregateOutputType = {
    order: number | null
  }

  export type TrainingModuleMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    cover: string | null
    role: string | null
    categoryId: string | null
    isPublished: boolean | null
    slug: string | null
    order: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrainingModuleMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    cover: string | null
    role: string | null
    categoryId: string | null
    isPublished: boolean | null
    slug: string | null
    order: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrainingModuleCountAggregateOutputType = {
    id: number
    title: number
    description: number
    cover: number
    role: number
    categoryId: number
    isPublished: number
    slug: number
    order: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TrainingModuleAvgAggregateInputType = {
    order?: true
  }

  export type TrainingModuleSumAggregateInputType = {
    order?: true
  }

  export type TrainingModuleMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    cover?: true
    role?: true
    categoryId?: true
    isPublished?: true
    slug?: true
    order?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrainingModuleMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    cover?: true
    role?: true
    categoryId?: true
    isPublished?: true
    slug?: true
    order?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrainingModuleCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    cover?: true
    role?: true
    categoryId?: true
    isPublished?: true
    slug?: true
    order?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TrainingModuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingModule to aggregate.
     */
    where?: TrainingModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingModules to fetch.
     */
    orderBy?: TrainingModuleOrderByWithRelationInput | TrainingModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrainingModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrainingModules
    **/
    _count?: true | TrainingModuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TrainingModuleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TrainingModuleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrainingModuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrainingModuleMaxAggregateInputType
  }

  export type GetTrainingModuleAggregateType<T extends TrainingModuleAggregateArgs> = {
        [P in keyof T & keyof AggregateTrainingModule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrainingModule[P]>
      : GetScalarType<T[P], AggregateTrainingModule[P]>
  }




  export type TrainingModuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingModuleWhereInput
    orderBy?: TrainingModuleOrderByWithAggregationInput | TrainingModuleOrderByWithAggregationInput[]
    by: TrainingModuleScalarFieldEnum[] | TrainingModuleScalarFieldEnum
    having?: TrainingModuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrainingModuleCountAggregateInputType | true
    _avg?: TrainingModuleAvgAggregateInputType
    _sum?: TrainingModuleSumAggregateInputType
    _min?: TrainingModuleMinAggregateInputType
    _max?: TrainingModuleMaxAggregateInputType
  }

  export type TrainingModuleGroupByOutputType = {
    id: string
    title: string
    description: string | null
    cover: string | null
    role: string
    categoryId: string | null
    isPublished: boolean
    slug: string
    order: number
    createdAt: Date
    updatedAt: Date
    _count: TrainingModuleCountAggregateOutputType | null
    _avg: TrainingModuleAvgAggregateOutputType | null
    _sum: TrainingModuleSumAggregateOutputType | null
    _min: TrainingModuleMinAggregateOutputType | null
    _max: TrainingModuleMaxAggregateOutputType | null
  }

  type GetTrainingModuleGroupByPayload<T extends TrainingModuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrainingModuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrainingModuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrainingModuleGroupByOutputType[P]>
            : GetScalarType<T[P], TrainingModuleGroupByOutputType[P]>
        }
      >
    >


  export type TrainingModuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    cover?: boolean
    role?: boolean
    categoryId?: boolean
    isPublished?: boolean
    slug?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | TrainingModule$categoryArgs<ExtArgs>
    topics?: boolean | TrainingModule$topicsArgs<ExtArgs>
    _count?: boolean | TrainingModuleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trainingModule"]>

  export type TrainingModuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    cover?: boolean
    role?: boolean
    categoryId?: boolean
    isPublished?: boolean
    slug?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | TrainingModule$categoryArgs<ExtArgs>
  }, ExtArgs["result"]["trainingModule"]>

  export type TrainingModuleSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    cover?: boolean
    role?: boolean
    categoryId?: boolean
    isPublished?: boolean
    slug?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TrainingModuleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | TrainingModule$categoryArgs<ExtArgs>
    topics?: boolean | TrainingModule$topicsArgs<ExtArgs>
    _count?: boolean | TrainingModuleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TrainingModuleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | TrainingModule$categoryArgs<ExtArgs>
  }

  export type $TrainingModulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrainingModule"
    objects: {
      category: Prisma.$TrainingCategoryPayload<ExtArgs> | null
      topics: Prisma.$TrainingTopicPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string | null
      cover: string | null
      role: string
      categoryId: string | null
      isPublished: boolean
      slug: string
      order: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["trainingModule"]>
    composites: {}
  }

  type TrainingModuleGetPayload<S extends boolean | null | undefined | TrainingModuleDefaultArgs> = $Result.GetResult<Prisma.$TrainingModulePayload, S>

  type TrainingModuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TrainingModuleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TrainingModuleCountAggregateInputType | true
    }

  export interface TrainingModuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrainingModule'], meta: { name: 'TrainingModule' } }
    /**
     * Find zero or one TrainingModule that matches the filter.
     * @param {TrainingModuleFindUniqueArgs} args - Arguments to find a TrainingModule
     * @example
     * // Get one TrainingModule
     * const trainingModule = await prisma.trainingModule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrainingModuleFindUniqueArgs>(args: SelectSubset<T, TrainingModuleFindUniqueArgs<ExtArgs>>): Prisma__TrainingModuleClient<$Result.GetResult<Prisma.$TrainingModulePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TrainingModule that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TrainingModuleFindUniqueOrThrowArgs} args - Arguments to find a TrainingModule
     * @example
     * // Get one TrainingModule
     * const trainingModule = await prisma.trainingModule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrainingModuleFindUniqueOrThrowArgs>(args: SelectSubset<T, TrainingModuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrainingModuleClient<$Result.GetResult<Prisma.$TrainingModulePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TrainingModule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingModuleFindFirstArgs} args - Arguments to find a TrainingModule
     * @example
     * // Get one TrainingModule
     * const trainingModule = await prisma.trainingModule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrainingModuleFindFirstArgs>(args?: SelectSubset<T, TrainingModuleFindFirstArgs<ExtArgs>>): Prisma__TrainingModuleClient<$Result.GetResult<Prisma.$TrainingModulePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TrainingModule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingModuleFindFirstOrThrowArgs} args - Arguments to find a TrainingModule
     * @example
     * // Get one TrainingModule
     * const trainingModule = await prisma.trainingModule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrainingModuleFindFirstOrThrowArgs>(args?: SelectSubset<T, TrainingModuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrainingModuleClient<$Result.GetResult<Prisma.$TrainingModulePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TrainingModules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingModuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrainingModules
     * const trainingModules = await prisma.trainingModule.findMany()
     * 
     * // Get first 10 TrainingModules
     * const trainingModules = await prisma.trainingModule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trainingModuleWithIdOnly = await prisma.trainingModule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TrainingModuleFindManyArgs>(args?: SelectSubset<T, TrainingModuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingModulePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TrainingModule.
     * @param {TrainingModuleCreateArgs} args - Arguments to create a TrainingModule.
     * @example
     * // Create one TrainingModule
     * const TrainingModule = await prisma.trainingModule.create({
     *   data: {
     *     // ... data to create a TrainingModule
     *   }
     * })
     * 
     */
    create<T extends TrainingModuleCreateArgs>(args: SelectSubset<T, TrainingModuleCreateArgs<ExtArgs>>): Prisma__TrainingModuleClient<$Result.GetResult<Prisma.$TrainingModulePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TrainingModules.
     * @param {TrainingModuleCreateManyArgs} args - Arguments to create many TrainingModules.
     * @example
     * // Create many TrainingModules
     * const trainingModule = await prisma.trainingModule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrainingModuleCreateManyArgs>(args?: SelectSubset<T, TrainingModuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TrainingModules and returns the data saved in the database.
     * @param {TrainingModuleCreateManyAndReturnArgs} args - Arguments to create many TrainingModules.
     * @example
     * // Create many TrainingModules
     * const trainingModule = await prisma.trainingModule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TrainingModules and only return the `id`
     * const trainingModuleWithIdOnly = await prisma.trainingModule.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrainingModuleCreateManyAndReturnArgs>(args?: SelectSubset<T, TrainingModuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingModulePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TrainingModule.
     * @param {TrainingModuleDeleteArgs} args - Arguments to delete one TrainingModule.
     * @example
     * // Delete one TrainingModule
     * const TrainingModule = await prisma.trainingModule.delete({
     *   where: {
     *     // ... filter to delete one TrainingModule
     *   }
     * })
     * 
     */
    delete<T extends TrainingModuleDeleteArgs>(args: SelectSubset<T, TrainingModuleDeleteArgs<ExtArgs>>): Prisma__TrainingModuleClient<$Result.GetResult<Prisma.$TrainingModulePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TrainingModule.
     * @param {TrainingModuleUpdateArgs} args - Arguments to update one TrainingModule.
     * @example
     * // Update one TrainingModule
     * const trainingModule = await prisma.trainingModule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrainingModuleUpdateArgs>(args: SelectSubset<T, TrainingModuleUpdateArgs<ExtArgs>>): Prisma__TrainingModuleClient<$Result.GetResult<Prisma.$TrainingModulePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TrainingModules.
     * @param {TrainingModuleDeleteManyArgs} args - Arguments to filter TrainingModules to delete.
     * @example
     * // Delete a few TrainingModules
     * const { count } = await prisma.trainingModule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrainingModuleDeleteManyArgs>(args?: SelectSubset<T, TrainingModuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrainingModules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingModuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrainingModules
     * const trainingModule = await prisma.trainingModule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrainingModuleUpdateManyArgs>(args: SelectSubset<T, TrainingModuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TrainingModule.
     * @param {TrainingModuleUpsertArgs} args - Arguments to update or create a TrainingModule.
     * @example
     * // Update or create a TrainingModule
     * const trainingModule = await prisma.trainingModule.upsert({
     *   create: {
     *     // ... data to create a TrainingModule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrainingModule we want to update
     *   }
     * })
     */
    upsert<T extends TrainingModuleUpsertArgs>(args: SelectSubset<T, TrainingModuleUpsertArgs<ExtArgs>>): Prisma__TrainingModuleClient<$Result.GetResult<Prisma.$TrainingModulePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TrainingModules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingModuleCountArgs} args - Arguments to filter TrainingModules to count.
     * @example
     * // Count the number of TrainingModules
     * const count = await prisma.trainingModule.count({
     *   where: {
     *     // ... the filter for the TrainingModules we want to count
     *   }
     * })
    **/
    count<T extends TrainingModuleCountArgs>(
      args?: Subset<T, TrainingModuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrainingModuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrainingModule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingModuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrainingModuleAggregateArgs>(args: Subset<T, TrainingModuleAggregateArgs>): Prisma.PrismaPromise<GetTrainingModuleAggregateType<T>>

    /**
     * Group by TrainingModule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingModuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrainingModuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrainingModuleGroupByArgs['orderBy'] }
        : { orderBy?: TrainingModuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrainingModuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrainingModuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrainingModule model
   */
  readonly fields: TrainingModuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrainingModule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrainingModuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends TrainingModule$categoryArgs<ExtArgs> = {}>(args?: Subset<T, TrainingModule$categoryArgs<ExtArgs>>): Prisma__TrainingCategoryClient<$Result.GetResult<Prisma.$TrainingCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    topics<T extends TrainingModule$topicsArgs<ExtArgs> = {}>(args?: Subset<T, TrainingModule$topicsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingTopicPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TrainingModule model
   */ 
  interface TrainingModuleFieldRefs {
    readonly id: FieldRef<"TrainingModule", 'String'>
    readonly title: FieldRef<"TrainingModule", 'String'>
    readonly description: FieldRef<"TrainingModule", 'String'>
    readonly cover: FieldRef<"TrainingModule", 'String'>
    readonly role: FieldRef<"TrainingModule", 'String'>
    readonly categoryId: FieldRef<"TrainingModule", 'String'>
    readonly isPublished: FieldRef<"TrainingModule", 'Boolean'>
    readonly slug: FieldRef<"TrainingModule", 'String'>
    readonly order: FieldRef<"TrainingModule", 'Int'>
    readonly createdAt: FieldRef<"TrainingModule", 'DateTime'>
    readonly updatedAt: FieldRef<"TrainingModule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TrainingModule findUnique
   */
  export type TrainingModuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModule
     */
    select?: TrainingModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingModuleInclude<ExtArgs> | null
    /**
     * Filter, which TrainingModule to fetch.
     */
    where: TrainingModuleWhereUniqueInput
  }

  /**
   * TrainingModule findUniqueOrThrow
   */
  export type TrainingModuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModule
     */
    select?: TrainingModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingModuleInclude<ExtArgs> | null
    /**
     * Filter, which TrainingModule to fetch.
     */
    where: TrainingModuleWhereUniqueInput
  }

  /**
   * TrainingModule findFirst
   */
  export type TrainingModuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModule
     */
    select?: TrainingModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingModuleInclude<ExtArgs> | null
    /**
     * Filter, which TrainingModule to fetch.
     */
    where?: TrainingModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingModules to fetch.
     */
    orderBy?: TrainingModuleOrderByWithRelationInput | TrainingModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingModules.
     */
    cursor?: TrainingModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingModules.
     */
    distinct?: TrainingModuleScalarFieldEnum | TrainingModuleScalarFieldEnum[]
  }

  /**
   * TrainingModule findFirstOrThrow
   */
  export type TrainingModuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModule
     */
    select?: TrainingModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingModuleInclude<ExtArgs> | null
    /**
     * Filter, which TrainingModule to fetch.
     */
    where?: TrainingModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingModules to fetch.
     */
    orderBy?: TrainingModuleOrderByWithRelationInput | TrainingModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingModules.
     */
    cursor?: TrainingModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingModules.
     */
    distinct?: TrainingModuleScalarFieldEnum | TrainingModuleScalarFieldEnum[]
  }

  /**
   * TrainingModule findMany
   */
  export type TrainingModuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModule
     */
    select?: TrainingModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingModuleInclude<ExtArgs> | null
    /**
     * Filter, which TrainingModules to fetch.
     */
    where?: TrainingModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingModules to fetch.
     */
    orderBy?: TrainingModuleOrderByWithRelationInput | TrainingModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrainingModules.
     */
    cursor?: TrainingModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingModules.
     */
    skip?: number
    distinct?: TrainingModuleScalarFieldEnum | TrainingModuleScalarFieldEnum[]
  }

  /**
   * TrainingModule create
   */
  export type TrainingModuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModule
     */
    select?: TrainingModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingModuleInclude<ExtArgs> | null
    /**
     * The data needed to create a TrainingModule.
     */
    data: XOR<TrainingModuleCreateInput, TrainingModuleUncheckedCreateInput>
  }

  /**
   * TrainingModule createMany
   */
  export type TrainingModuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrainingModules.
     */
    data: TrainingModuleCreateManyInput | TrainingModuleCreateManyInput[]
  }

  /**
   * TrainingModule createManyAndReturn
   */
  export type TrainingModuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModule
     */
    select?: TrainingModuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TrainingModules.
     */
    data: TrainingModuleCreateManyInput | TrainingModuleCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingModuleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TrainingModule update
   */
  export type TrainingModuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModule
     */
    select?: TrainingModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingModuleInclude<ExtArgs> | null
    /**
     * The data needed to update a TrainingModule.
     */
    data: XOR<TrainingModuleUpdateInput, TrainingModuleUncheckedUpdateInput>
    /**
     * Choose, which TrainingModule to update.
     */
    where: TrainingModuleWhereUniqueInput
  }

  /**
   * TrainingModule updateMany
   */
  export type TrainingModuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrainingModules.
     */
    data: XOR<TrainingModuleUpdateManyMutationInput, TrainingModuleUncheckedUpdateManyInput>
    /**
     * Filter which TrainingModules to update
     */
    where?: TrainingModuleWhereInput
  }

  /**
   * TrainingModule upsert
   */
  export type TrainingModuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModule
     */
    select?: TrainingModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingModuleInclude<ExtArgs> | null
    /**
     * The filter to search for the TrainingModule to update in case it exists.
     */
    where: TrainingModuleWhereUniqueInput
    /**
     * In case the TrainingModule found by the `where` argument doesn't exist, create a new TrainingModule with this data.
     */
    create: XOR<TrainingModuleCreateInput, TrainingModuleUncheckedCreateInput>
    /**
     * In case the TrainingModule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrainingModuleUpdateInput, TrainingModuleUncheckedUpdateInput>
  }

  /**
   * TrainingModule delete
   */
  export type TrainingModuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModule
     */
    select?: TrainingModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingModuleInclude<ExtArgs> | null
    /**
     * Filter which TrainingModule to delete.
     */
    where: TrainingModuleWhereUniqueInput
  }

  /**
   * TrainingModule deleteMany
   */
  export type TrainingModuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingModules to delete
     */
    where?: TrainingModuleWhereInput
  }

  /**
   * TrainingModule.category
   */
  export type TrainingModule$categoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingCategory
     */
    select?: TrainingCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingCategoryInclude<ExtArgs> | null
    where?: TrainingCategoryWhereInput
  }

  /**
   * TrainingModule.topics
   */
  export type TrainingModule$topicsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopic
     */
    select?: TrainingTopicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingTopicInclude<ExtArgs> | null
    where?: TrainingTopicWhereInput
    orderBy?: TrainingTopicOrderByWithRelationInput | TrainingTopicOrderByWithRelationInput[]
    cursor?: TrainingTopicWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrainingTopicScalarFieldEnum | TrainingTopicScalarFieldEnum[]
  }

  /**
   * TrainingModule without action
   */
  export type TrainingModuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingModule
     */
    select?: TrainingModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingModuleInclude<ExtArgs> | null
  }


  /**
   * Model TrainingTopic
   */

  export type AggregateTrainingTopic = {
    _count: TrainingTopicCountAggregateOutputType | null
    _avg: TrainingTopicAvgAggregateOutputType | null
    _sum: TrainingTopicSumAggregateOutputType | null
    _min: TrainingTopicMinAggregateOutputType | null
    _max: TrainingTopicMaxAggregateOutputType | null
  }

  export type TrainingTopicAvgAggregateOutputType = {
    order: number | null
  }

  export type TrainingTopicSumAggregateOutputType = {
    order: number | null
  }

  export type TrainingTopicMinAggregateOutputType = {
    id: string | null
    moduleId: string | null
    title: string | null
    description: string | null
    order: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrainingTopicMaxAggregateOutputType = {
    id: string | null
    moduleId: string | null
    title: string | null
    description: string | null
    order: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrainingTopicCountAggregateOutputType = {
    id: number
    moduleId: number
    title: number
    description: number
    order: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TrainingTopicAvgAggregateInputType = {
    order?: true
  }

  export type TrainingTopicSumAggregateInputType = {
    order?: true
  }

  export type TrainingTopicMinAggregateInputType = {
    id?: true
    moduleId?: true
    title?: true
    description?: true
    order?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrainingTopicMaxAggregateInputType = {
    id?: true
    moduleId?: true
    title?: true
    description?: true
    order?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrainingTopicCountAggregateInputType = {
    id?: true
    moduleId?: true
    title?: true
    description?: true
    order?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TrainingTopicAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingTopic to aggregate.
     */
    where?: TrainingTopicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingTopics to fetch.
     */
    orderBy?: TrainingTopicOrderByWithRelationInput | TrainingTopicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrainingTopicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingTopics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingTopics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrainingTopics
    **/
    _count?: true | TrainingTopicCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TrainingTopicAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TrainingTopicSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrainingTopicMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrainingTopicMaxAggregateInputType
  }

  export type GetTrainingTopicAggregateType<T extends TrainingTopicAggregateArgs> = {
        [P in keyof T & keyof AggregateTrainingTopic]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrainingTopic[P]>
      : GetScalarType<T[P], AggregateTrainingTopic[P]>
  }




  export type TrainingTopicGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingTopicWhereInput
    orderBy?: TrainingTopicOrderByWithAggregationInput | TrainingTopicOrderByWithAggregationInput[]
    by: TrainingTopicScalarFieldEnum[] | TrainingTopicScalarFieldEnum
    having?: TrainingTopicScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrainingTopicCountAggregateInputType | true
    _avg?: TrainingTopicAvgAggregateInputType
    _sum?: TrainingTopicSumAggregateInputType
    _min?: TrainingTopicMinAggregateInputType
    _max?: TrainingTopicMaxAggregateInputType
  }

  export type TrainingTopicGroupByOutputType = {
    id: string
    moduleId: string
    title: string
    description: string | null
    order: number
    createdAt: Date
    updatedAt: Date
    _count: TrainingTopicCountAggregateOutputType | null
    _avg: TrainingTopicAvgAggregateOutputType | null
    _sum: TrainingTopicSumAggregateOutputType | null
    _min: TrainingTopicMinAggregateOutputType | null
    _max: TrainingTopicMaxAggregateOutputType | null
  }

  type GetTrainingTopicGroupByPayload<T extends TrainingTopicGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrainingTopicGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrainingTopicGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrainingTopicGroupByOutputType[P]>
            : GetScalarType<T[P], TrainingTopicGroupByOutputType[P]>
        }
      >
    >


  export type TrainingTopicSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    moduleId?: boolean
    title?: boolean
    description?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    module?: boolean | TrainingModuleDefaultArgs<ExtArgs>
    pages?: boolean | TrainingTopic$pagesArgs<ExtArgs>
    _count?: boolean | TrainingTopicCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trainingTopic"]>

  export type TrainingTopicSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    moduleId?: boolean
    title?: boolean
    description?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    module?: boolean | TrainingModuleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trainingTopic"]>

  export type TrainingTopicSelectScalar = {
    id?: boolean
    moduleId?: boolean
    title?: boolean
    description?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TrainingTopicInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    module?: boolean | TrainingModuleDefaultArgs<ExtArgs>
    pages?: boolean | TrainingTopic$pagesArgs<ExtArgs>
    _count?: boolean | TrainingTopicCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TrainingTopicIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    module?: boolean | TrainingModuleDefaultArgs<ExtArgs>
  }

  export type $TrainingTopicPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrainingTopic"
    objects: {
      module: Prisma.$TrainingModulePayload<ExtArgs>
      pages: Prisma.$TrainingPagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      moduleId: string
      title: string
      description: string | null
      order: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["trainingTopic"]>
    composites: {}
  }

  type TrainingTopicGetPayload<S extends boolean | null | undefined | TrainingTopicDefaultArgs> = $Result.GetResult<Prisma.$TrainingTopicPayload, S>

  type TrainingTopicCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TrainingTopicFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TrainingTopicCountAggregateInputType | true
    }

  export interface TrainingTopicDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrainingTopic'], meta: { name: 'TrainingTopic' } }
    /**
     * Find zero or one TrainingTopic that matches the filter.
     * @param {TrainingTopicFindUniqueArgs} args - Arguments to find a TrainingTopic
     * @example
     * // Get one TrainingTopic
     * const trainingTopic = await prisma.trainingTopic.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrainingTopicFindUniqueArgs>(args: SelectSubset<T, TrainingTopicFindUniqueArgs<ExtArgs>>): Prisma__TrainingTopicClient<$Result.GetResult<Prisma.$TrainingTopicPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TrainingTopic that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TrainingTopicFindUniqueOrThrowArgs} args - Arguments to find a TrainingTopic
     * @example
     * // Get one TrainingTopic
     * const trainingTopic = await prisma.trainingTopic.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrainingTopicFindUniqueOrThrowArgs>(args: SelectSubset<T, TrainingTopicFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrainingTopicClient<$Result.GetResult<Prisma.$TrainingTopicPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TrainingTopic that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingTopicFindFirstArgs} args - Arguments to find a TrainingTopic
     * @example
     * // Get one TrainingTopic
     * const trainingTopic = await prisma.trainingTopic.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrainingTopicFindFirstArgs>(args?: SelectSubset<T, TrainingTopicFindFirstArgs<ExtArgs>>): Prisma__TrainingTopicClient<$Result.GetResult<Prisma.$TrainingTopicPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TrainingTopic that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingTopicFindFirstOrThrowArgs} args - Arguments to find a TrainingTopic
     * @example
     * // Get one TrainingTopic
     * const trainingTopic = await prisma.trainingTopic.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrainingTopicFindFirstOrThrowArgs>(args?: SelectSubset<T, TrainingTopicFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrainingTopicClient<$Result.GetResult<Prisma.$TrainingTopicPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TrainingTopics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingTopicFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrainingTopics
     * const trainingTopics = await prisma.trainingTopic.findMany()
     * 
     * // Get first 10 TrainingTopics
     * const trainingTopics = await prisma.trainingTopic.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trainingTopicWithIdOnly = await prisma.trainingTopic.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TrainingTopicFindManyArgs>(args?: SelectSubset<T, TrainingTopicFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingTopicPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TrainingTopic.
     * @param {TrainingTopicCreateArgs} args - Arguments to create a TrainingTopic.
     * @example
     * // Create one TrainingTopic
     * const TrainingTopic = await prisma.trainingTopic.create({
     *   data: {
     *     // ... data to create a TrainingTopic
     *   }
     * })
     * 
     */
    create<T extends TrainingTopicCreateArgs>(args: SelectSubset<T, TrainingTopicCreateArgs<ExtArgs>>): Prisma__TrainingTopicClient<$Result.GetResult<Prisma.$TrainingTopicPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TrainingTopics.
     * @param {TrainingTopicCreateManyArgs} args - Arguments to create many TrainingTopics.
     * @example
     * // Create many TrainingTopics
     * const trainingTopic = await prisma.trainingTopic.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrainingTopicCreateManyArgs>(args?: SelectSubset<T, TrainingTopicCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TrainingTopics and returns the data saved in the database.
     * @param {TrainingTopicCreateManyAndReturnArgs} args - Arguments to create many TrainingTopics.
     * @example
     * // Create many TrainingTopics
     * const trainingTopic = await prisma.trainingTopic.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TrainingTopics and only return the `id`
     * const trainingTopicWithIdOnly = await prisma.trainingTopic.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrainingTopicCreateManyAndReturnArgs>(args?: SelectSubset<T, TrainingTopicCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingTopicPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TrainingTopic.
     * @param {TrainingTopicDeleteArgs} args - Arguments to delete one TrainingTopic.
     * @example
     * // Delete one TrainingTopic
     * const TrainingTopic = await prisma.trainingTopic.delete({
     *   where: {
     *     // ... filter to delete one TrainingTopic
     *   }
     * })
     * 
     */
    delete<T extends TrainingTopicDeleteArgs>(args: SelectSubset<T, TrainingTopicDeleteArgs<ExtArgs>>): Prisma__TrainingTopicClient<$Result.GetResult<Prisma.$TrainingTopicPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TrainingTopic.
     * @param {TrainingTopicUpdateArgs} args - Arguments to update one TrainingTopic.
     * @example
     * // Update one TrainingTopic
     * const trainingTopic = await prisma.trainingTopic.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrainingTopicUpdateArgs>(args: SelectSubset<T, TrainingTopicUpdateArgs<ExtArgs>>): Prisma__TrainingTopicClient<$Result.GetResult<Prisma.$TrainingTopicPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TrainingTopics.
     * @param {TrainingTopicDeleteManyArgs} args - Arguments to filter TrainingTopics to delete.
     * @example
     * // Delete a few TrainingTopics
     * const { count } = await prisma.trainingTopic.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrainingTopicDeleteManyArgs>(args?: SelectSubset<T, TrainingTopicDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrainingTopics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingTopicUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrainingTopics
     * const trainingTopic = await prisma.trainingTopic.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrainingTopicUpdateManyArgs>(args: SelectSubset<T, TrainingTopicUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TrainingTopic.
     * @param {TrainingTopicUpsertArgs} args - Arguments to update or create a TrainingTopic.
     * @example
     * // Update or create a TrainingTopic
     * const trainingTopic = await prisma.trainingTopic.upsert({
     *   create: {
     *     // ... data to create a TrainingTopic
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrainingTopic we want to update
     *   }
     * })
     */
    upsert<T extends TrainingTopicUpsertArgs>(args: SelectSubset<T, TrainingTopicUpsertArgs<ExtArgs>>): Prisma__TrainingTopicClient<$Result.GetResult<Prisma.$TrainingTopicPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TrainingTopics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingTopicCountArgs} args - Arguments to filter TrainingTopics to count.
     * @example
     * // Count the number of TrainingTopics
     * const count = await prisma.trainingTopic.count({
     *   where: {
     *     // ... the filter for the TrainingTopics we want to count
     *   }
     * })
    **/
    count<T extends TrainingTopicCountArgs>(
      args?: Subset<T, TrainingTopicCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrainingTopicCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrainingTopic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingTopicAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrainingTopicAggregateArgs>(args: Subset<T, TrainingTopicAggregateArgs>): Prisma.PrismaPromise<GetTrainingTopicAggregateType<T>>

    /**
     * Group by TrainingTopic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingTopicGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrainingTopicGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrainingTopicGroupByArgs['orderBy'] }
        : { orderBy?: TrainingTopicGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrainingTopicGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrainingTopicGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrainingTopic model
   */
  readonly fields: TrainingTopicFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrainingTopic.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrainingTopicClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    module<T extends TrainingModuleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrainingModuleDefaultArgs<ExtArgs>>): Prisma__TrainingModuleClient<$Result.GetResult<Prisma.$TrainingModulePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    pages<T extends TrainingTopic$pagesArgs<ExtArgs> = {}>(args?: Subset<T, TrainingTopic$pagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingPagePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TrainingTopic model
   */ 
  interface TrainingTopicFieldRefs {
    readonly id: FieldRef<"TrainingTopic", 'String'>
    readonly moduleId: FieldRef<"TrainingTopic", 'String'>
    readonly title: FieldRef<"TrainingTopic", 'String'>
    readonly description: FieldRef<"TrainingTopic", 'String'>
    readonly order: FieldRef<"TrainingTopic", 'Int'>
    readonly createdAt: FieldRef<"TrainingTopic", 'DateTime'>
    readonly updatedAt: FieldRef<"TrainingTopic", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TrainingTopic findUnique
   */
  export type TrainingTopicFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopic
     */
    select?: TrainingTopicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingTopicInclude<ExtArgs> | null
    /**
     * Filter, which TrainingTopic to fetch.
     */
    where: TrainingTopicWhereUniqueInput
  }

  /**
   * TrainingTopic findUniqueOrThrow
   */
  export type TrainingTopicFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopic
     */
    select?: TrainingTopicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingTopicInclude<ExtArgs> | null
    /**
     * Filter, which TrainingTopic to fetch.
     */
    where: TrainingTopicWhereUniqueInput
  }

  /**
   * TrainingTopic findFirst
   */
  export type TrainingTopicFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopic
     */
    select?: TrainingTopicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingTopicInclude<ExtArgs> | null
    /**
     * Filter, which TrainingTopic to fetch.
     */
    where?: TrainingTopicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingTopics to fetch.
     */
    orderBy?: TrainingTopicOrderByWithRelationInput | TrainingTopicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingTopics.
     */
    cursor?: TrainingTopicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingTopics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingTopics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingTopics.
     */
    distinct?: TrainingTopicScalarFieldEnum | TrainingTopicScalarFieldEnum[]
  }

  /**
   * TrainingTopic findFirstOrThrow
   */
  export type TrainingTopicFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopic
     */
    select?: TrainingTopicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingTopicInclude<ExtArgs> | null
    /**
     * Filter, which TrainingTopic to fetch.
     */
    where?: TrainingTopicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingTopics to fetch.
     */
    orderBy?: TrainingTopicOrderByWithRelationInput | TrainingTopicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingTopics.
     */
    cursor?: TrainingTopicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingTopics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingTopics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingTopics.
     */
    distinct?: TrainingTopicScalarFieldEnum | TrainingTopicScalarFieldEnum[]
  }

  /**
   * TrainingTopic findMany
   */
  export type TrainingTopicFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopic
     */
    select?: TrainingTopicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingTopicInclude<ExtArgs> | null
    /**
     * Filter, which TrainingTopics to fetch.
     */
    where?: TrainingTopicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingTopics to fetch.
     */
    orderBy?: TrainingTopicOrderByWithRelationInput | TrainingTopicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrainingTopics.
     */
    cursor?: TrainingTopicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingTopics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingTopics.
     */
    skip?: number
    distinct?: TrainingTopicScalarFieldEnum | TrainingTopicScalarFieldEnum[]
  }

  /**
   * TrainingTopic create
   */
  export type TrainingTopicCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopic
     */
    select?: TrainingTopicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingTopicInclude<ExtArgs> | null
    /**
     * The data needed to create a TrainingTopic.
     */
    data: XOR<TrainingTopicCreateInput, TrainingTopicUncheckedCreateInput>
  }

  /**
   * TrainingTopic createMany
   */
  export type TrainingTopicCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrainingTopics.
     */
    data: TrainingTopicCreateManyInput | TrainingTopicCreateManyInput[]
  }

  /**
   * TrainingTopic createManyAndReturn
   */
  export type TrainingTopicCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopic
     */
    select?: TrainingTopicSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TrainingTopics.
     */
    data: TrainingTopicCreateManyInput | TrainingTopicCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingTopicIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TrainingTopic update
   */
  export type TrainingTopicUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopic
     */
    select?: TrainingTopicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingTopicInclude<ExtArgs> | null
    /**
     * The data needed to update a TrainingTopic.
     */
    data: XOR<TrainingTopicUpdateInput, TrainingTopicUncheckedUpdateInput>
    /**
     * Choose, which TrainingTopic to update.
     */
    where: TrainingTopicWhereUniqueInput
  }

  /**
   * TrainingTopic updateMany
   */
  export type TrainingTopicUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrainingTopics.
     */
    data: XOR<TrainingTopicUpdateManyMutationInput, TrainingTopicUncheckedUpdateManyInput>
    /**
     * Filter which TrainingTopics to update
     */
    where?: TrainingTopicWhereInput
  }

  /**
   * TrainingTopic upsert
   */
  export type TrainingTopicUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopic
     */
    select?: TrainingTopicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingTopicInclude<ExtArgs> | null
    /**
     * The filter to search for the TrainingTopic to update in case it exists.
     */
    where: TrainingTopicWhereUniqueInput
    /**
     * In case the TrainingTopic found by the `where` argument doesn't exist, create a new TrainingTopic with this data.
     */
    create: XOR<TrainingTopicCreateInput, TrainingTopicUncheckedCreateInput>
    /**
     * In case the TrainingTopic was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrainingTopicUpdateInput, TrainingTopicUncheckedUpdateInput>
  }

  /**
   * TrainingTopic delete
   */
  export type TrainingTopicDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopic
     */
    select?: TrainingTopicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingTopicInclude<ExtArgs> | null
    /**
     * Filter which TrainingTopic to delete.
     */
    where: TrainingTopicWhereUniqueInput
  }

  /**
   * TrainingTopic deleteMany
   */
  export type TrainingTopicDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingTopics to delete
     */
    where?: TrainingTopicWhereInput
  }

  /**
   * TrainingTopic.pages
   */
  export type TrainingTopic$pagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPage
     */
    select?: TrainingPageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingPageInclude<ExtArgs> | null
    where?: TrainingPageWhereInput
    orderBy?: TrainingPageOrderByWithRelationInput | TrainingPageOrderByWithRelationInput[]
    cursor?: TrainingPageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrainingPageScalarFieldEnum | TrainingPageScalarFieldEnum[]
  }

  /**
   * TrainingTopic without action
   */
  export type TrainingTopicDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingTopic
     */
    select?: TrainingTopicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingTopicInclude<ExtArgs> | null
  }


  /**
   * Model TrainingPage
   */

  export type AggregateTrainingPage = {
    _count: TrainingPageCountAggregateOutputType | null
    _avg: TrainingPageAvgAggregateOutputType | null
    _sum: TrainingPageSumAggregateOutputType | null
    _min: TrainingPageMinAggregateOutputType | null
    _max: TrainingPageMaxAggregateOutputType | null
  }

  export type TrainingPageAvgAggregateOutputType = {
    order: number | null
  }

  export type TrainingPageSumAggregateOutputType = {
    order: number | null
  }

  export type TrainingPageMinAggregateOutputType = {
    id: string | null
    topicId: string | null
    title: string | null
    content: string | null
    order: number | null
    isPublished: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrainingPageMaxAggregateOutputType = {
    id: string | null
    topicId: string | null
    title: string | null
    content: string | null
    order: number | null
    isPublished: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrainingPageCountAggregateOutputType = {
    id: number
    topicId: number
    title: number
    content: number
    order: number
    isPublished: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TrainingPageAvgAggregateInputType = {
    order?: true
  }

  export type TrainingPageSumAggregateInputType = {
    order?: true
  }

  export type TrainingPageMinAggregateInputType = {
    id?: true
    topicId?: true
    title?: true
    content?: true
    order?: true
    isPublished?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrainingPageMaxAggregateInputType = {
    id?: true
    topicId?: true
    title?: true
    content?: true
    order?: true
    isPublished?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrainingPageCountAggregateInputType = {
    id?: true
    topicId?: true
    title?: true
    content?: true
    order?: true
    isPublished?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TrainingPageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingPage to aggregate.
     */
    where?: TrainingPageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingPages to fetch.
     */
    orderBy?: TrainingPageOrderByWithRelationInput | TrainingPageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrainingPageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingPages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingPages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrainingPages
    **/
    _count?: true | TrainingPageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TrainingPageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TrainingPageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrainingPageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrainingPageMaxAggregateInputType
  }

  export type GetTrainingPageAggregateType<T extends TrainingPageAggregateArgs> = {
        [P in keyof T & keyof AggregateTrainingPage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrainingPage[P]>
      : GetScalarType<T[P], AggregateTrainingPage[P]>
  }




  export type TrainingPageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingPageWhereInput
    orderBy?: TrainingPageOrderByWithAggregationInput | TrainingPageOrderByWithAggregationInput[]
    by: TrainingPageScalarFieldEnum[] | TrainingPageScalarFieldEnum
    having?: TrainingPageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrainingPageCountAggregateInputType | true
    _avg?: TrainingPageAvgAggregateInputType
    _sum?: TrainingPageSumAggregateInputType
    _min?: TrainingPageMinAggregateInputType
    _max?: TrainingPageMaxAggregateInputType
  }

  export type TrainingPageGroupByOutputType = {
    id: string
    topicId: string
    title: string
    content: string
    order: number
    isPublished: boolean
    createdAt: Date
    updatedAt: Date
    _count: TrainingPageCountAggregateOutputType | null
    _avg: TrainingPageAvgAggregateOutputType | null
    _sum: TrainingPageSumAggregateOutputType | null
    _min: TrainingPageMinAggregateOutputType | null
    _max: TrainingPageMaxAggregateOutputType | null
  }

  type GetTrainingPageGroupByPayload<T extends TrainingPageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrainingPageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrainingPageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrainingPageGroupByOutputType[P]>
            : GetScalarType<T[P], TrainingPageGroupByOutputType[P]>
        }
      >
    >


  export type TrainingPageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    topicId?: boolean
    title?: boolean
    content?: boolean
    order?: boolean
    isPublished?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    topic?: boolean | TrainingTopicDefaultArgs<ExtArgs>
    attachments?: boolean | TrainingPage$attachmentsArgs<ExtArgs>
    _count?: boolean | TrainingPageCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trainingPage"]>

  export type TrainingPageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    topicId?: boolean
    title?: boolean
    content?: boolean
    order?: boolean
    isPublished?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    topic?: boolean | TrainingTopicDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trainingPage"]>

  export type TrainingPageSelectScalar = {
    id?: boolean
    topicId?: boolean
    title?: boolean
    content?: boolean
    order?: boolean
    isPublished?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TrainingPageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    topic?: boolean | TrainingTopicDefaultArgs<ExtArgs>
    attachments?: boolean | TrainingPage$attachmentsArgs<ExtArgs>
    _count?: boolean | TrainingPageCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TrainingPageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    topic?: boolean | TrainingTopicDefaultArgs<ExtArgs>
  }

  export type $TrainingPagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrainingPage"
    objects: {
      topic: Prisma.$TrainingTopicPayload<ExtArgs>
      attachments: Prisma.$TrainingAttachmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      topicId: string
      title: string
      content: string
      order: number
      isPublished: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["trainingPage"]>
    composites: {}
  }

  type TrainingPageGetPayload<S extends boolean | null | undefined | TrainingPageDefaultArgs> = $Result.GetResult<Prisma.$TrainingPagePayload, S>

  type TrainingPageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TrainingPageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TrainingPageCountAggregateInputType | true
    }

  export interface TrainingPageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrainingPage'], meta: { name: 'TrainingPage' } }
    /**
     * Find zero or one TrainingPage that matches the filter.
     * @param {TrainingPageFindUniqueArgs} args - Arguments to find a TrainingPage
     * @example
     * // Get one TrainingPage
     * const trainingPage = await prisma.trainingPage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrainingPageFindUniqueArgs>(args: SelectSubset<T, TrainingPageFindUniqueArgs<ExtArgs>>): Prisma__TrainingPageClient<$Result.GetResult<Prisma.$TrainingPagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TrainingPage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TrainingPageFindUniqueOrThrowArgs} args - Arguments to find a TrainingPage
     * @example
     * // Get one TrainingPage
     * const trainingPage = await prisma.trainingPage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrainingPageFindUniqueOrThrowArgs>(args: SelectSubset<T, TrainingPageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrainingPageClient<$Result.GetResult<Prisma.$TrainingPagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TrainingPage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingPageFindFirstArgs} args - Arguments to find a TrainingPage
     * @example
     * // Get one TrainingPage
     * const trainingPage = await prisma.trainingPage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrainingPageFindFirstArgs>(args?: SelectSubset<T, TrainingPageFindFirstArgs<ExtArgs>>): Prisma__TrainingPageClient<$Result.GetResult<Prisma.$TrainingPagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TrainingPage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingPageFindFirstOrThrowArgs} args - Arguments to find a TrainingPage
     * @example
     * // Get one TrainingPage
     * const trainingPage = await prisma.trainingPage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrainingPageFindFirstOrThrowArgs>(args?: SelectSubset<T, TrainingPageFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrainingPageClient<$Result.GetResult<Prisma.$TrainingPagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TrainingPages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingPageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrainingPages
     * const trainingPages = await prisma.trainingPage.findMany()
     * 
     * // Get first 10 TrainingPages
     * const trainingPages = await prisma.trainingPage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trainingPageWithIdOnly = await prisma.trainingPage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TrainingPageFindManyArgs>(args?: SelectSubset<T, TrainingPageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingPagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TrainingPage.
     * @param {TrainingPageCreateArgs} args - Arguments to create a TrainingPage.
     * @example
     * // Create one TrainingPage
     * const TrainingPage = await prisma.trainingPage.create({
     *   data: {
     *     // ... data to create a TrainingPage
     *   }
     * })
     * 
     */
    create<T extends TrainingPageCreateArgs>(args: SelectSubset<T, TrainingPageCreateArgs<ExtArgs>>): Prisma__TrainingPageClient<$Result.GetResult<Prisma.$TrainingPagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TrainingPages.
     * @param {TrainingPageCreateManyArgs} args - Arguments to create many TrainingPages.
     * @example
     * // Create many TrainingPages
     * const trainingPage = await prisma.trainingPage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrainingPageCreateManyArgs>(args?: SelectSubset<T, TrainingPageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TrainingPages and returns the data saved in the database.
     * @param {TrainingPageCreateManyAndReturnArgs} args - Arguments to create many TrainingPages.
     * @example
     * // Create many TrainingPages
     * const trainingPage = await prisma.trainingPage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TrainingPages and only return the `id`
     * const trainingPageWithIdOnly = await prisma.trainingPage.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrainingPageCreateManyAndReturnArgs>(args?: SelectSubset<T, TrainingPageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingPagePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TrainingPage.
     * @param {TrainingPageDeleteArgs} args - Arguments to delete one TrainingPage.
     * @example
     * // Delete one TrainingPage
     * const TrainingPage = await prisma.trainingPage.delete({
     *   where: {
     *     // ... filter to delete one TrainingPage
     *   }
     * })
     * 
     */
    delete<T extends TrainingPageDeleteArgs>(args: SelectSubset<T, TrainingPageDeleteArgs<ExtArgs>>): Prisma__TrainingPageClient<$Result.GetResult<Prisma.$TrainingPagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TrainingPage.
     * @param {TrainingPageUpdateArgs} args - Arguments to update one TrainingPage.
     * @example
     * // Update one TrainingPage
     * const trainingPage = await prisma.trainingPage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrainingPageUpdateArgs>(args: SelectSubset<T, TrainingPageUpdateArgs<ExtArgs>>): Prisma__TrainingPageClient<$Result.GetResult<Prisma.$TrainingPagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TrainingPages.
     * @param {TrainingPageDeleteManyArgs} args - Arguments to filter TrainingPages to delete.
     * @example
     * // Delete a few TrainingPages
     * const { count } = await prisma.trainingPage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrainingPageDeleteManyArgs>(args?: SelectSubset<T, TrainingPageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrainingPages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingPageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrainingPages
     * const trainingPage = await prisma.trainingPage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrainingPageUpdateManyArgs>(args: SelectSubset<T, TrainingPageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TrainingPage.
     * @param {TrainingPageUpsertArgs} args - Arguments to update or create a TrainingPage.
     * @example
     * // Update or create a TrainingPage
     * const trainingPage = await prisma.trainingPage.upsert({
     *   create: {
     *     // ... data to create a TrainingPage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrainingPage we want to update
     *   }
     * })
     */
    upsert<T extends TrainingPageUpsertArgs>(args: SelectSubset<T, TrainingPageUpsertArgs<ExtArgs>>): Prisma__TrainingPageClient<$Result.GetResult<Prisma.$TrainingPagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TrainingPages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingPageCountArgs} args - Arguments to filter TrainingPages to count.
     * @example
     * // Count the number of TrainingPages
     * const count = await prisma.trainingPage.count({
     *   where: {
     *     // ... the filter for the TrainingPages we want to count
     *   }
     * })
    **/
    count<T extends TrainingPageCountArgs>(
      args?: Subset<T, TrainingPageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrainingPageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrainingPage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingPageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrainingPageAggregateArgs>(args: Subset<T, TrainingPageAggregateArgs>): Prisma.PrismaPromise<GetTrainingPageAggregateType<T>>

    /**
     * Group by TrainingPage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingPageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrainingPageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrainingPageGroupByArgs['orderBy'] }
        : { orderBy?: TrainingPageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrainingPageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrainingPageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrainingPage model
   */
  readonly fields: TrainingPageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrainingPage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrainingPageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    topic<T extends TrainingTopicDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrainingTopicDefaultArgs<ExtArgs>>): Prisma__TrainingTopicClient<$Result.GetResult<Prisma.$TrainingTopicPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    attachments<T extends TrainingPage$attachmentsArgs<ExtArgs> = {}>(args?: Subset<T, TrainingPage$attachmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingAttachmentPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TrainingPage model
   */ 
  interface TrainingPageFieldRefs {
    readonly id: FieldRef<"TrainingPage", 'String'>
    readonly topicId: FieldRef<"TrainingPage", 'String'>
    readonly title: FieldRef<"TrainingPage", 'String'>
    readonly content: FieldRef<"TrainingPage", 'String'>
    readonly order: FieldRef<"TrainingPage", 'Int'>
    readonly isPublished: FieldRef<"TrainingPage", 'Boolean'>
    readonly createdAt: FieldRef<"TrainingPage", 'DateTime'>
    readonly updatedAt: FieldRef<"TrainingPage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TrainingPage findUnique
   */
  export type TrainingPageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPage
     */
    select?: TrainingPageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingPageInclude<ExtArgs> | null
    /**
     * Filter, which TrainingPage to fetch.
     */
    where: TrainingPageWhereUniqueInput
  }

  /**
   * TrainingPage findUniqueOrThrow
   */
  export type TrainingPageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPage
     */
    select?: TrainingPageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingPageInclude<ExtArgs> | null
    /**
     * Filter, which TrainingPage to fetch.
     */
    where: TrainingPageWhereUniqueInput
  }

  /**
   * TrainingPage findFirst
   */
  export type TrainingPageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPage
     */
    select?: TrainingPageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingPageInclude<ExtArgs> | null
    /**
     * Filter, which TrainingPage to fetch.
     */
    where?: TrainingPageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingPages to fetch.
     */
    orderBy?: TrainingPageOrderByWithRelationInput | TrainingPageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingPages.
     */
    cursor?: TrainingPageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingPages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingPages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingPages.
     */
    distinct?: TrainingPageScalarFieldEnum | TrainingPageScalarFieldEnum[]
  }

  /**
   * TrainingPage findFirstOrThrow
   */
  export type TrainingPageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPage
     */
    select?: TrainingPageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingPageInclude<ExtArgs> | null
    /**
     * Filter, which TrainingPage to fetch.
     */
    where?: TrainingPageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingPages to fetch.
     */
    orderBy?: TrainingPageOrderByWithRelationInput | TrainingPageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingPages.
     */
    cursor?: TrainingPageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingPages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingPages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingPages.
     */
    distinct?: TrainingPageScalarFieldEnum | TrainingPageScalarFieldEnum[]
  }

  /**
   * TrainingPage findMany
   */
  export type TrainingPageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPage
     */
    select?: TrainingPageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingPageInclude<ExtArgs> | null
    /**
     * Filter, which TrainingPages to fetch.
     */
    where?: TrainingPageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingPages to fetch.
     */
    orderBy?: TrainingPageOrderByWithRelationInput | TrainingPageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrainingPages.
     */
    cursor?: TrainingPageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingPages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingPages.
     */
    skip?: number
    distinct?: TrainingPageScalarFieldEnum | TrainingPageScalarFieldEnum[]
  }

  /**
   * TrainingPage create
   */
  export type TrainingPageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPage
     */
    select?: TrainingPageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingPageInclude<ExtArgs> | null
    /**
     * The data needed to create a TrainingPage.
     */
    data: XOR<TrainingPageCreateInput, TrainingPageUncheckedCreateInput>
  }

  /**
   * TrainingPage createMany
   */
  export type TrainingPageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrainingPages.
     */
    data: TrainingPageCreateManyInput | TrainingPageCreateManyInput[]
  }

  /**
   * TrainingPage createManyAndReturn
   */
  export type TrainingPageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPage
     */
    select?: TrainingPageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TrainingPages.
     */
    data: TrainingPageCreateManyInput | TrainingPageCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingPageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TrainingPage update
   */
  export type TrainingPageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPage
     */
    select?: TrainingPageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingPageInclude<ExtArgs> | null
    /**
     * The data needed to update a TrainingPage.
     */
    data: XOR<TrainingPageUpdateInput, TrainingPageUncheckedUpdateInput>
    /**
     * Choose, which TrainingPage to update.
     */
    where: TrainingPageWhereUniqueInput
  }

  /**
   * TrainingPage updateMany
   */
  export type TrainingPageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrainingPages.
     */
    data: XOR<TrainingPageUpdateManyMutationInput, TrainingPageUncheckedUpdateManyInput>
    /**
     * Filter which TrainingPages to update
     */
    where?: TrainingPageWhereInput
  }

  /**
   * TrainingPage upsert
   */
  export type TrainingPageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPage
     */
    select?: TrainingPageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingPageInclude<ExtArgs> | null
    /**
     * The filter to search for the TrainingPage to update in case it exists.
     */
    where: TrainingPageWhereUniqueInput
    /**
     * In case the TrainingPage found by the `where` argument doesn't exist, create a new TrainingPage with this data.
     */
    create: XOR<TrainingPageCreateInput, TrainingPageUncheckedCreateInput>
    /**
     * In case the TrainingPage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrainingPageUpdateInput, TrainingPageUncheckedUpdateInput>
  }

  /**
   * TrainingPage delete
   */
  export type TrainingPageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPage
     */
    select?: TrainingPageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingPageInclude<ExtArgs> | null
    /**
     * Filter which TrainingPage to delete.
     */
    where: TrainingPageWhereUniqueInput
  }

  /**
   * TrainingPage deleteMany
   */
  export type TrainingPageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingPages to delete
     */
    where?: TrainingPageWhereInput
  }

  /**
   * TrainingPage.attachments
   */
  export type TrainingPage$attachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAttachment
     */
    select?: TrainingAttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingAttachmentInclude<ExtArgs> | null
    where?: TrainingAttachmentWhereInput
    orderBy?: TrainingAttachmentOrderByWithRelationInput | TrainingAttachmentOrderByWithRelationInput[]
    cursor?: TrainingAttachmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrainingAttachmentScalarFieldEnum | TrainingAttachmentScalarFieldEnum[]
  }

  /**
   * TrainingPage without action
   */
  export type TrainingPageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingPage
     */
    select?: TrainingPageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingPageInclude<ExtArgs> | null
  }


  /**
   * Model TrainingAttachment
   */

  export type AggregateTrainingAttachment = {
    _count: TrainingAttachmentCountAggregateOutputType | null
    _avg: TrainingAttachmentAvgAggregateOutputType | null
    _sum: TrainingAttachmentSumAggregateOutputType | null
    _min: TrainingAttachmentMinAggregateOutputType | null
    _max: TrainingAttachmentMaxAggregateOutputType | null
  }

  export type TrainingAttachmentAvgAggregateOutputType = {
    size: number | null
  }

  export type TrainingAttachmentSumAggregateOutputType = {
    size: number | null
  }

  export type TrainingAttachmentMinAggregateOutputType = {
    id: string | null
    pageId: string | null
    name: string | null
    url: string | null
    size: number | null
    type: string | null
    createdAt: Date | null
  }

  export type TrainingAttachmentMaxAggregateOutputType = {
    id: string | null
    pageId: string | null
    name: string | null
    url: string | null
    size: number | null
    type: string | null
    createdAt: Date | null
  }

  export type TrainingAttachmentCountAggregateOutputType = {
    id: number
    pageId: number
    name: number
    url: number
    size: number
    type: number
    createdAt: number
    _all: number
  }


  export type TrainingAttachmentAvgAggregateInputType = {
    size?: true
  }

  export type TrainingAttachmentSumAggregateInputType = {
    size?: true
  }

  export type TrainingAttachmentMinAggregateInputType = {
    id?: true
    pageId?: true
    name?: true
    url?: true
    size?: true
    type?: true
    createdAt?: true
  }

  export type TrainingAttachmentMaxAggregateInputType = {
    id?: true
    pageId?: true
    name?: true
    url?: true
    size?: true
    type?: true
    createdAt?: true
  }

  export type TrainingAttachmentCountAggregateInputType = {
    id?: true
    pageId?: true
    name?: true
    url?: true
    size?: true
    type?: true
    createdAt?: true
    _all?: true
  }

  export type TrainingAttachmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingAttachment to aggregate.
     */
    where?: TrainingAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingAttachments to fetch.
     */
    orderBy?: TrainingAttachmentOrderByWithRelationInput | TrainingAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrainingAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrainingAttachments
    **/
    _count?: true | TrainingAttachmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TrainingAttachmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TrainingAttachmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrainingAttachmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrainingAttachmentMaxAggregateInputType
  }

  export type GetTrainingAttachmentAggregateType<T extends TrainingAttachmentAggregateArgs> = {
        [P in keyof T & keyof AggregateTrainingAttachment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrainingAttachment[P]>
      : GetScalarType<T[P], AggregateTrainingAttachment[P]>
  }




  export type TrainingAttachmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingAttachmentWhereInput
    orderBy?: TrainingAttachmentOrderByWithAggregationInput | TrainingAttachmentOrderByWithAggregationInput[]
    by: TrainingAttachmentScalarFieldEnum[] | TrainingAttachmentScalarFieldEnum
    having?: TrainingAttachmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrainingAttachmentCountAggregateInputType | true
    _avg?: TrainingAttachmentAvgAggregateInputType
    _sum?: TrainingAttachmentSumAggregateInputType
    _min?: TrainingAttachmentMinAggregateInputType
    _max?: TrainingAttachmentMaxAggregateInputType
  }

  export type TrainingAttachmentGroupByOutputType = {
    id: string
    pageId: string
    name: string
    url: string
    size: number
    type: string
    createdAt: Date
    _count: TrainingAttachmentCountAggregateOutputType | null
    _avg: TrainingAttachmentAvgAggregateOutputType | null
    _sum: TrainingAttachmentSumAggregateOutputType | null
    _min: TrainingAttachmentMinAggregateOutputType | null
    _max: TrainingAttachmentMaxAggregateOutputType | null
  }

  type GetTrainingAttachmentGroupByPayload<T extends TrainingAttachmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrainingAttachmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrainingAttachmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrainingAttachmentGroupByOutputType[P]>
            : GetScalarType<T[P], TrainingAttachmentGroupByOutputType[P]>
        }
      >
    >


  export type TrainingAttachmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pageId?: boolean
    name?: boolean
    url?: boolean
    size?: boolean
    type?: boolean
    createdAt?: boolean
    page?: boolean | TrainingPageDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trainingAttachment"]>

  export type TrainingAttachmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pageId?: boolean
    name?: boolean
    url?: boolean
    size?: boolean
    type?: boolean
    createdAt?: boolean
    page?: boolean | TrainingPageDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trainingAttachment"]>

  export type TrainingAttachmentSelectScalar = {
    id?: boolean
    pageId?: boolean
    name?: boolean
    url?: boolean
    size?: boolean
    type?: boolean
    createdAt?: boolean
  }

  export type TrainingAttachmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    page?: boolean | TrainingPageDefaultArgs<ExtArgs>
  }
  export type TrainingAttachmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    page?: boolean | TrainingPageDefaultArgs<ExtArgs>
  }

  export type $TrainingAttachmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrainingAttachment"
    objects: {
      page: Prisma.$TrainingPagePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      pageId: string
      name: string
      url: string
      size: number
      type: string
      createdAt: Date
    }, ExtArgs["result"]["trainingAttachment"]>
    composites: {}
  }

  type TrainingAttachmentGetPayload<S extends boolean | null | undefined | TrainingAttachmentDefaultArgs> = $Result.GetResult<Prisma.$TrainingAttachmentPayload, S>

  type TrainingAttachmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TrainingAttachmentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TrainingAttachmentCountAggregateInputType | true
    }

  export interface TrainingAttachmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrainingAttachment'], meta: { name: 'TrainingAttachment' } }
    /**
     * Find zero or one TrainingAttachment that matches the filter.
     * @param {TrainingAttachmentFindUniqueArgs} args - Arguments to find a TrainingAttachment
     * @example
     * // Get one TrainingAttachment
     * const trainingAttachment = await prisma.trainingAttachment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrainingAttachmentFindUniqueArgs>(args: SelectSubset<T, TrainingAttachmentFindUniqueArgs<ExtArgs>>): Prisma__TrainingAttachmentClient<$Result.GetResult<Prisma.$TrainingAttachmentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TrainingAttachment that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TrainingAttachmentFindUniqueOrThrowArgs} args - Arguments to find a TrainingAttachment
     * @example
     * // Get one TrainingAttachment
     * const trainingAttachment = await prisma.trainingAttachment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrainingAttachmentFindUniqueOrThrowArgs>(args: SelectSubset<T, TrainingAttachmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrainingAttachmentClient<$Result.GetResult<Prisma.$TrainingAttachmentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TrainingAttachment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAttachmentFindFirstArgs} args - Arguments to find a TrainingAttachment
     * @example
     * // Get one TrainingAttachment
     * const trainingAttachment = await prisma.trainingAttachment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrainingAttachmentFindFirstArgs>(args?: SelectSubset<T, TrainingAttachmentFindFirstArgs<ExtArgs>>): Prisma__TrainingAttachmentClient<$Result.GetResult<Prisma.$TrainingAttachmentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TrainingAttachment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAttachmentFindFirstOrThrowArgs} args - Arguments to find a TrainingAttachment
     * @example
     * // Get one TrainingAttachment
     * const trainingAttachment = await prisma.trainingAttachment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrainingAttachmentFindFirstOrThrowArgs>(args?: SelectSubset<T, TrainingAttachmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrainingAttachmentClient<$Result.GetResult<Prisma.$TrainingAttachmentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TrainingAttachments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAttachmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrainingAttachments
     * const trainingAttachments = await prisma.trainingAttachment.findMany()
     * 
     * // Get first 10 TrainingAttachments
     * const trainingAttachments = await prisma.trainingAttachment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trainingAttachmentWithIdOnly = await prisma.trainingAttachment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TrainingAttachmentFindManyArgs>(args?: SelectSubset<T, TrainingAttachmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingAttachmentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TrainingAttachment.
     * @param {TrainingAttachmentCreateArgs} args - Arguments to create a TrainingAttachment.
     * @example
     * // Create one TrainingAttachment
     * const TrainingAttachment = await prisma.trainingAttachment.create({
     *   data: {
     *     // ... data to create a TrainingAttachment
     *   }
     * })
     * 
     */
    create<T extends TrainingAttachmentCreateArgs>(args: SelectSubset<T, TrainingAttachmentCreateArgs<ExtArgs>>): Prisma__TrainingAttachmentClient<$Result.GetResult<Prisma.$TrainingAttachmentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TrainingAttachments.
     * @param {TrainingAttachmentCreateManyArgs} args - Arguments to create many TrainingAttachments.
     * @example
     * // Create many TrainingAttachments
     * const trainingAttachment = await prisma.trainingAttachment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrainingAttachmentCreateManyArgs>(args?: SelectSubset<T, TrainingAttachmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TrainingAttachments and returns the data saved in the database.
     * @param {TrainingAttachmentCreateManyAndReturnArgs} args - Arguments to create many TrainingAttachments.
     * @example
     * // Create many TrainingAttachments
     * const trainingAttachment = await prisma.trainingAttachment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TrainingAttachments and only return the `id`
     * const trainingAttachmentWithIdOnly = await prisma.trainingAttachment.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrainingAttachmentCreateManyAndReturnArgs>(args?: SelectSubset<T, TrainingAttachmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingAttachmentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TrainingAttachment.
     * @param {TrainingAttachmentDeleteArgs} args - Arguments to delete one TrainingAttachment.
     * @example
     * // Delete one TrainingAttachment
     * const TrainingAttachment = await prisma.trainingAttachment.delete({
     *   where: {
     *     // ... filter to delete one TrainingAttachment
     *   }
     * })
     * 
     */
    delete<T extends TrainingAttachmentDeleteArgs>(args: SelectSubset<T, TrainingAttachmentDeleteArgs<ExtArgs>>): Prisma__TrainingAttachmentClient<$Result.GetResult<Prisma.$TrainingAttachmentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TrainingAttachment.
     * @param {TrainingAttachmentUpdateArgs} args - Arguments to update one TrainingAttachment.
     * @example
     * // Update one TrainingAttachment
     * const trainingAttachment = await prisma.trainingAttachment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrainingAttachmentUpdateArgs>(args: SelectSubset<T, TrainingAttachmentUpdateArgs<ExtArgs>>): Prisma__TrainingAttachmentClient<$Result.GetResult<Prisma.$TrainingAttachmentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TrainingAttachments.
     * @param {TrainingAttachmentDeleteManyArgs} args - Arguments to filter TrainingAttachments to delete.
     * @example
     * // Delete a few TrainingAttachments
     * const { count } = await prisma.trainingAttachment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrainingAttachmentDeleteManyArgs>(args?: SelectSubset<T, TrainingAttachmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrainingAttachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAttachmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrainingAttachments
     * const trainingAttachment = await prisma.trainingAttachment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrainingAttachmentUpdateManyArgs>(args: SelectSubset<T, TrainingAttachmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TrainingAttachment.
     * @param {TrainingAttachmentUpsertArgs} args - Arguments to update or create a TrainingAttachment.
     * @example
     * // Update or create a TrainingAttachment
     * const trainingAttachment = await prisma.trainingAttachment.upsert({
     *   create: {
     *     // ... data to create a TrainingAttachment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrainingAttachment we want to update
     *   }
     * })
     */
    upsert<T extends TrainingAttachmentUpsertArgs>(args: SelectSubset<T, TrainingAttachmentUpsertArgs<ExtArgs>>): Prisma__TrainingAttachmentClient<$Result.GetResult<Prisma.$TrainingAttachmentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TrainingAttachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAttachmentCountArgs} args - Arguments to filter TrainingAttachments to count.
     * @example
     * // Count the number of TrainingAttachments
     * const count = await prisma.trainingAttachment.count({
     *   where: {
     *     // ... the filter for the TrainingAttachments we want to count
     *   }
     * })
    **/
    count<T extends TrainingAttachmentCountArgs>(
      args?: Subset<T, TrainingAttachmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrainingAttachmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrainingAttachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAttachmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrainingAttachmentAggregateArgs>(args: Subset<T, TrainingAttachmentAggregateArgs>): Prisma.PrismaPromise<GetTrainingAttachmentAggregateType<T>>

    /**
     * Group by TrainingAttachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAttachmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrainingAttachmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrainingAttachmentGroupByArgs['orderBy'] }
        : { orderBy?: TrainingAttachmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrainingAttachmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrainingAttachmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrainingAttachment model
   */
  readonly fields: TrainingAttachmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrainingAttachment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrainingAttachmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    page<T extends TrainingPageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrainingPageDefaultArgs<ExtArgs>>): Prisma__TrainingPageClient<$Result.GetResult<Prisma.$TrainingPagePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TrainingAttachment model
   */ 
  interface TrainingAttachmentFieldRefs {
    readonly id: FieldRef<"TrainingAttachment", 'String'>
    readonly pageId: FieldRef<"TrainingAttachment", 'String'>
    readonly name: FieldRef<"TrainingAttachment", 'String'>
    readonly url: FieldRef<"TrainingAttachment", 'String'>
    readonly size: FieldRef<"TrainingAttachment", 'Int'>
    readonly type: FieldRef<"TrainingAttachment", 'String'>
    readonly createdAt: FieldRef<"TrainingAttachment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TrainingAttachment findUnique
   */
  export type TrainingAttachmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAttachment
     */
    select?: TrainingAttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which TrainingAttachment to fetch.
     */
    where: TrainingAttachmentWhereUniqueInput
  }

  /**
   * TrainingAttachment findUniqueOrThrow
   */
  export type TrainingAttachmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAttachment
     */
    select?: TrainingAttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which TrainingAttachment to fetch.
     */
    where: TrainingAttachmentWhereUniqueInput
  }

  /**
   * TrainingAttachment findFirst
   */
  export type TrainingAttachmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAttachment
     */
    select?: TrainingAttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which TrainingAttachment to fetch.
     */
    where?: TrainingAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingAttachments to fetch.
     */
    orderBy?: TrainingAttachmentOrderByWithRelationInput | TrainingAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingAttachments.
     */
    cursor?: TrainingAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingAttachments.
     */
    distinct?: TrainingAttachmentScalarFieldEnum | TrainingAttachmentScalarFieldEnum[]
  }

  /**
   * TrainingAttachment findFirstOrThrow
   */
  export type TrainingAttachmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAttachment
     */
    select?: TrainingAttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which TrainingAttachment to fetch.
     */
    where?: TrainingAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingAttachments to fetch.
     */
    orderBy?: TrainingAttachmentOrderByWithRelationInput | TrainingAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingAttachments.
     */
    cursor?: TrainingAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingAttachments.
     */
    distinct?: TrainingAttachmentScalarFieldEnum | TrainingAttachmentScalarFieldEnum[]
  }

  /**
   * TrainingAttachment findMany
   */
  export type TrainingAttachmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAttachment
     */
    select?: TrainingAttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which TrainingAttachments to fetch.
     */
    where?: TrainingAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingAttachments to fetch.
     */
    orderBy?: TrainingAttachmentOrderByWithRelationInput | TrainingAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrainingAttachments.
     */
    cursor?: TrainingAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingAttachments.
     */
    skip?: number
    distinct?: TrainingAttachmentScalarFieldEnum | TrainingAttachmentScalarFieldEnum[]
  }

  /**
   * TrainingAttachment create
   */
  export type TrainingAttachmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAttachment
     */
    select?: TrainingAttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingAttachmentInclude<ExtArgs> | null
    /**
     * The data needed to create a TrainingAttachment.
     */
    data: XOR<TrainingAttachmentCreateInput, TrainingAttachmentUncheckedCreateInput>
  }

  /**
   * TrainingAttachment createMany
   */
  export type TrainingAttachmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrainingAttachments.
     */
    data: TrainingAttachmentCreateManyInput | TrainingAttachmentCreateManyInput[]
  }

  /**
   * TrainingAttachment createManyAndReturn
   */
  export type TrainingAttachmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAttachment
     */
    select?: TrainingAttachmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TrainingAttachments.
     */
    data: TrainingAttachmentCreateManyInput | TrainingAttachmentCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingAttachmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TrainingAttachment update
   */
  export type TrainingAttachmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAttachment
     */
    select?: TrainingAttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingAttachmentInclude<ExtArgs> | null
    /**
     * The data needed to update a TrainingAttachment.
     */
    data: XOR<TrainingAttachmentUpdateInput, TrainingAttachmentUncheckedUpdateInput>
    /**
     * Choose, which TrainingAttachment to update.
     */
    where: TrainingAttachmentWhereUniqueInput
  }

  /**
   * TrainingAttachment updateMany
   */
  export type TrainingAttachmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrainingAttachments.
     */
    data: XOR<TrainingAttachmentUpdateManyMutationInput, TrainingAttachmentUncheckedUpdateManyInput>
    /**
     * Filter which TrainingAttachments to update
     */
    where?: TrainingAttachmentWhereInput
  }

  /**
   * TrainingAttachment upsert
   */
  export type TrainingAttachmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAttachment
     */
    select?: TrainingAttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingAttachmentInclude<ExtArgs> | null
    /**
     * The filter to search for the TrainingAttachment to update in case it exists.
     */
    where: TrainingAttachmentWhereUniqueInput
    /**
     * In case the TrainingAttachment found by the `where` argument doesn't exist, create a new TrainingAttachment with this data.
     */
    create: XOR<TrainingAttachmentCreateInput, TrainingAttachmentUncheckedCreateInput>
    /**
     * In case the TrainingAttachment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrainingAttachmentUpdateInput, TrainingAttachmentUncheckedUpdateInput>
  }

  /**
   * TrainingAttachment delete
   */
  export type TrainingAttachmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAttachment
     */
    select?: TrainingAttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingAttachmentInclude<ExtArgs> | null
    /**
     * Filter which TrainingAttachment to delete.
     */
    where: TrainingAttachmentWhereUniqueInput
  }

  /**
   * TrainingAttachment deleteMany
   */
  export type TrainingAttachmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingAttachments to delete
     */
    where?: TrainingAttachmentWhereInput
  }

  /**
   * TrainingAttachment without action
   */
  export type TrainingAttachmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAttachment
     */
    select?: TrainingAttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingAttachmentInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TrainingCategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TrainingCategoryScalarFieldEnum = (typeof TrainingCategoryScalarFieldEnum)[keyof typeof TrainingCategoryScalarFieldEnum]


  export const TrainingModuleScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    cover: 'cover',
    role: 'role',
    categoryId: 'categoryId',
    isPublished: 'isPublished',
    slug: 'slug',
    order: 'order',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TrainingModuleScalarFieldEnum = (typeof TrainingModuleScalarFieldEnum)[keyof typeof TrainingModuleScalarFieldEnum]


  export const TrainingTopicScalarFieldEnum: {
    id: 'id',
    moduleId: 'moduleId',
    title: 'title',
    description: 'description',
    order: 'order',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TrainingTopicScalarFieldEnum = (typeof TrainingTopicScalarFieldEnum)[keyof typeof TrainingTopicScalarFieldEnum]


  export const TrainingPageScalarFieldEnum: {
    id: 'id',
    topicId: 'topicId',
    title: 'title',
    content: 'content',
    order: 'order',
    isPublished: 'isPublished',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TrainingPageScalarFieldEnum = (typeof TrainingPageScalarFieldEnum)[keyof typeof TrainingPageScalarFieldEnum]


  export const TrainingAttachmentScalarFieldEnum: {
    id: 'id',
    pageId: 'pageId',
    name: 'name',
    url: 'url',
    size: 'size',
    type: 'type',
    createdAt: 'createdAt'
  };

  export type TrainingAttachmentScalarFieldEnum = (typeof TrainingAttachmentScalarFieldEnum)[keyof typeof TrainingAttachmentScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type TrainingCategoryWhereInput = {
    AND?: TrainingCategoryWhereInput | TrainingCategoryWhereInput[]
    OR?: TrainingCategoryWhereInput[]
    NOT?: TrainingCategoryWhereInput | TrainingCategoryWhereInput[]
    id?: StringFilter<"TrainingCategory"> | string
    name?: StringFilter<"TrainingCategory"> | string
    slug?: StringFilter<"TrainingCategory"> | string
    description?: StringNullableFilter<"TrainingCategory"> | string | null
    createdAt?: DateTimeFilter<"TrainingCategory"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingCategory"> | Date | string
    modules?: TrainingModuleListRelationFilter
  }

  export type TrainingCategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    modules?: TrainingModuleOrderByRelationAggregateInput
  }

  export type TrainingCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    slug?: string
    AND?: TrainingCategoryWhereInput | TrainingCategoryWhereInput[]
    OR?: TrainingCategoryWhereInput[]
    NOT?: TrainingCategoryWhereInput | TrainingCategoryWhereInput[]
    description?: StringNullableFilter<"TrainingCategory"> | string | null
    createdAt?: DateTimeFilter<"TrainingCategory"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingCategory"> | Date | string
    modules?: TrainingModuleListRelationFilter
  }, "id" | "name" | "slug">

  export type TrainingCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TrainingCategoryCountOrderByAggregateInput
    _max?: TrainingCategoryMaxOrderByAggregateInput
    _min?: TrainingCategoryMinOrderByAggregateInput
  }

  export type TrainingCategoryScalarWhereWithAggregatesInput = {
    AND?: TrainingCategoryScalarWhereWithAggregatesInput | TrainingCategoryScalarWhereWithAggregatesInput[]
    OR?: TrainingCategoryScalarWhereWithAggregatesInput[]
    NOT?: TrainingCategoryScalarWhereWithAggregatesInput | TrainingCategoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TrainingCategory"> | string
    name?: StringWithAggregatesFilter<"TrainingCategory"> | string
    slug?: StringWithAggregatesFilter<"TrainingCategory"> | string
    description?: StringNullableWithAggregatesFilter<"TrainingCategory"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"TrainingCategory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TrainingCategory"> | Date | string
  }

  export type TrainingModuleWhereInput = {
    AND?: TrainingModuleWhereInput | TrainingModuleWhereInput[]
    OR?: TrainingModuleWhereInput[]
    NOT?: TrainingModuleWhereInput | TrainingModuleWhereInput[]
    id?: StringFilter<"TrainingModule"> | string
    title?: StringFilter<"TrainingModule"> | string
    description?: StringNullableFilter<"TrainingModule"> | string | null
    cover?: StringNullableFilter<"TrainingModule"> | string | null
    role?: StringFilter<"TrainingModule"> | string
    categoryId?: StringNullableFilter<"TrainingModule"> | string | null
    isPublished?: BoolFilter<"TrainingModule"> | boolean
    slug?: StringFilter<"TrainingModule"> | string
    order?: IntFilter<"TrainingModule"> | number
    createdAt?: DateTimeFilter<"TrainingModule"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingModule"> | Date | string
    category?: XOR<TrainingCategoryNullableRelationFilter, TrainingCategoryWhereInput> | null
    topics?: TrainingTopicListRelationFilter
  }

  export type TrainingModuleOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    cover?: SortOrderInput | SortOrder
    role?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    isPublished?: SortOrder
    slug?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    category?: TrainingCategoryOrderByWithRelationInput
    topics?: TrainingTopicOrderByRelationAggregateInput
  }

  export type TrainingModuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: TrainingModuleWhereInput | TrainingModuleWhereInput[]
    OR?: TrainingModuleWhereInput[]
    NOT?: TrainingModuleWhereInput | TrainingModuleWhereInput[]
    title?: StringFilter<"TrainingModule"> | string
    description?: StringNullableFilter<"TrainingModule"> | string | null
    cover?: StringNullableFilter<"TrainingModule"> | string | null
    role?: StringFilter<"TrainingModule"> | string
    categoryId?: StringNullableFilter<"TrainingModule"> | string | null
    isPublished?: BoolFilter<"TrainingModule"> | boolean
    order?: IntFilter<"TrainingModule"> | number
    createdAt?: DateTimeFilter<"TrainingModule"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingModule"> | Date | string
    category?: XOR<TrainingCategoryNullableRelationFilter, TrainingCategoryWhereInput> | null
    topics?: TrainingTopicListRelationFilter
  }, "id" | "slug">

  export type TrainingModuleOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    cover?: SortOrderInput | SortOrder
    role?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    isPublished?: SortOrder
    slug?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TrainingModuleCountOrderByAggregateInput
    _avg?: TrainingModuleAvgOrderByAggregateInput
    _max?: TrainingModuleMaxOrderByAggregateInput
    _min?: TrainingModuleMinOrderByAggregateInput
    _sum?: TrainingModuleSumOrderByAggregateInput
  }

  export type TrainingModuleScalarWhereWithAggregatesInput = {
    AND?: TrainingModuleScalarWhereWithAggregatesInput | TrainingModuleScalarWhereWithAggregatesInput[]
    OR?: TrainingModuleScalarWhereWithAggregatesInput[]
    NOT?: TrainingModuleScalarWhereWithAggregatesInput | TrainingModuleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TrainingModule"> | string
    title?: StringWithAggregatesFilter<"TrainingModule"> | string
    description?: StringNullableWithAggregatesFilter<"TrainingModule"> | string | null
    cover?: StringNullableWithAggregatesFilter<"TrainingModule"> | string | null
    role?: StringWithAggregatesFilter<"TrainingModule"> | string
    categoryId?: StringNullableWithAggregatesFilter<"TrainingModule"> | string | null
    isPublished?: BoolWithAggregatesFilter<"TrainingModule"> | boolean
    slug?: StringWithAggregatesFilter<"TrainingModule"> | string
    order?: IntWithAggregatesFilter<"TrainingModule"> | number
    createdAt?: DateTimeWithAggregatesFilter<"TrainingModule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TrainingModule"> | Date | string
  }

  export type TrainingTopicWhereInput = {
    AND?: TrainingTopicWhereInput | TrainingTopicWhereInput[]
    OR?: TrainingTopicWhereInput[]
    NOT?: TrainingTopicWhereInput | TrainingTopicWhereInput[]
    id?: StringFilter<"TrainingTopic"> | string
    moduleId?: StringFilter<"TrainingTopic"> | string
    title?: StringFilter<"TrainingTopic"> | string
    description?: StringNullableFilter<"TrainingTopic"> | string | null
    order?: IntFilter<"TrainingTopic"> | number
    createdAt?: DateTimeFilter<"TrainingTopic"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingTopic"> | Date | string
    module?: XOR<TrainingModuleRelationFilter, TrainingModuleWhereInput>
    pages?: TrainingPageListRelationFilter
  }

  export type TrainingTopicOrderByWithRelationInput = {
    id?: SortOrder
    moduleId?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    module?: TrainingModuleOrderByWithRelationInput
    pages?: TrainingPageOrderByRelationAggregateInput
  }

  export type TrainingTopicWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TrainingTopicWhereInput | TrainingTopicWhereInput[]
    OR?: TrainingTopicWhereInput[]
    NOT?: TrainingTopicWhereInput | TrainingTopicWhereInput[]
    moduleId?: StringFilter<"TrainingTopic"> | string
    title?: StringFilter<"TrainingTopic"> | string
    description?: StringNullableFilter<"TrainingTopic"> | string | null
    order?: IntFilter<"TrainingTopic"> | number
    createdAt?: DateTimeFilter<"TrainingTopic"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingTopic"> | Date | string
    module?: XOR<TrainingModuleRelationFilter, TrainingModuleWhereInput>
    pages?: TrainingPageListRelationFilter
  }, "id">

  export type TrainingTopicOrderByWithAggregationInput = {
    id?: SortOrder
    moduleId?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TrainingTopicCountOrderByAggregateInput
    _avg?: TrainingTopicAvgOrderByAggregateInput
    _max?: TrainingTopicMaxOrderByAggregateInput
    _min?: TrainingTopicMinOrderByAggregateInput
    _sum?: TrainingTopicSumOrderByAggregateInput
  }

  export type TrainingTopicScalarWhereWithAggregatesInput = {
    AND?: TrainingTopicScalarWhereWithAggregatesInput | TrainingTopicScalarWhereWithAggregatesInput[]
    OR?: TrainingTopicScalarWhereWithAggregatesInput[]
    NOT?: TrainingTopicScalarWhereWithAggregatesInput | TrainingTopicScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TrainingTopic"> | string
    moduleId?: StringWithAggregatesFilter<"TrainingTopic"> | string
    title?: StringWithAggregatesFilter<"TrainingTopic"> | string
    description?: StringNullableWithAggregatesFilter<"TrainingTopic"> | string | null
    order?: IntWithAggregatesFilter<"TrainingTopic"> | number
    createdAt?: DateTimeWithAggregatesFilter<"TrainingTopic"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TrainingTopic"> | Date | string
  }

  export type TrainingPageWhereInput = {
    AND?: TrainingPageWhereInput | TrainingPageWhereInput[]
    OR?: TrainingPageWhereInput[]
    NOT?: TrainingPageWhereInput | TrainingPageWhereInput[]
    id?: StringFilter<"TrainingPage"> | string
    topicId?: StringFilter<"TrainingPage"> | string
    title?: StringFilter<"TrainingPage"> | string
    content?: StringFilter<"TrainingPage"> | string
    order?: IntFilter<"TrainingPage"> | number
    isPublished?: BoolFilter<"TrainingPage"> | boolean
    createdAt?: DateTimeFilter<"TrainingPage"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingPage"> | Date | string
    topic?: XOR<TrainingTopicRelationFilter, TrainingTopicWhereInput>
    attachments?: TrainingAttachmentListRelationFilter
  }

  export type TrainingPageOrderByWithRelationInput = {
    id?: SortOrder
    topicId?: SortOrder
    title?: SortOrder
    content?: SortOrder
    order?: SortOrder
    isPublished?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    topic?: TrainingTopicOrderByWithRelationInput
    attachments?: TrainingAttachmentOrderByRelationAggregateInput
  }

  export type TrainingPageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TrainingPageWhereInput | TrainingPageWhereInput[]
    OR?: TrainingPageWhereInput[]
    NOT?: TrainingPageWhereInput | TrainingPageWhereInput[]
    topicId?: StringFilter<"TrainingPage"> | string
    title?: StringFilter<"TrainingPage"> | string
    content?: StringFilter<"TrainingPage"> | string
    order?: IntFilter<"TrainingPage"> | number
    isPublished?: BoolFilter<"TrainingPage"> | boolean
    createdAt?: DateTimeFilter<"TrainingPage"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingPage"> | Date | string
    topic?: XOR<TrainingTopicRelationFilter, TrainingTopicWhereInput>
    attachments?: TrainingAttachmentListRelationFilter
  }, "id">

  export type TrainingPageOrderByWithAggregationInput = {
    id?: SortOrder
    topicId?: SortOrder
    title?: SortOrder
    content?: SortOrder
    order?: SortOrder
    isPublished?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TrainingPageCountOrderByAggregateInput
    _avg?: TrainingPageAvgOrderByAggregateInput
    _max?: TrainingPageMaxOrderByAggregateInput
    _min?: TrainingPageMinOrderByAggregateInput
    _sum?: TrainingPageSumOrderByAggregateInput
  }

  export type TrainingPageScalarWhereWithAggregatesInput = {
    AND?: TrainingPageScalarWhereWithAggregatesInput | TrainingPageScalarWhereWithAggregatesInput[]
    OR?: TrainingPageScalarWhereWithAggregatesInput[]
    NOT?: TrainingPageScalarWhereWithAggregatesInput | TrainingPageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TrainingPage"> | string
    topicId?: StringWithAggregatesFilter<"TrainingPage"> | string
    title?: StringWithAggregatesFilter<"TrainingPage"> | string
    content?: StringWithAggregatesFilter<"TrainingPage"> | string
    order?: IntWithAggregatesFilter<"TrainingPage"> | number
    isPublished?: BoolWithAggregatesFilter<"TrainingPage"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"TrainingPage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TrainingPage"> | Date | string
  }

  export type TrainingAttachmentWhereInput = {
    AND?: TrainingAttachmentWhereInput | TrainingAttachmentWhereInput[]
    OR?: TrainingAttachmentWhereInput[]
    NOT?: TrainingAttachmentWhereInput | TrainingAttachmentWhereInput[]
    id?: StringFilter<"TrainingAttachment"> | string
    pageId?: StringFilter<"TrainingAttachment"> | string
    name?: StringFilter<"TrainingAttachment"> | string
    url?: StringFilter<"TrainingAttachment"> | string
    size?: IntFilter<"TrainingAttachment"> | number
    type?: StringFilter<"TrainingAttachment"> | string
    createdAt?: DateTimeFilter<"TrainingAttachment"> | Date | string
    page?: XOR<TrainingPageRelationFilter, TrainingPageWhereInput>
  }

  export type TrainingAttachmentOrderByWithRelationInput = {
    id?: SortOrder
    pageId?: SortOrder
    name?: SortOrder
    url?: SortOrder
    size?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    page?: TrainingPageOrderByWithRelationInput
  }

  export type TrainingAttachmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TrainingAttachmentWhereInput | TrainingAttachmentWhereInput[]
    OR?: TrainingAttachmentWhereInput[]
    NOT?: TrainingAttachmentWhereInput | TrainingAttachmentWhereInput[]
    pageId?: StringFilter<"TrainingAttachment"> | string
    name?: StringFilter<"TrainingAttachment"> | string
    url?: StringFilter<"TrainingAttachment"> | string
    size?: IntFilter<"TrainingAttachment"> | number
    type?: StringFilter<"TrainingAttachment"> | string
    createdAt?: DateTimeFilter<"TrainingAttachment"> | Date | string
    page?: XOR<TrainingPageRelationFilter, TrainingPageWhereInput>
  }, "id">

  export type TrainingAttachmentOrderByWithAggregationInput = {
    id?: SortOrder
    pageId?: SortOrder
    name?: SortOrder
    url?: SortOrder
    size?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    _count?: TrainingAttachmentCountOrderByAggregateInput
    _avg?: TrainingAttachmentAvgOrderByAggregateInput
    _max?: TrainingAttachmentMaxOrderByAggregateInput
    _min?: TrainingAttachmentMinOrderByAggregateInput
    _sum?: TrainingAttachmentSumOrderByAggregateInput
  }

  export type TrainingAttachmentScalarWhereWithAggregatesInput = {
    AND?: TrainingAttachmentScalarWhereWithAggregatesInput | TrainingAttachmentScalarWhereWithAggregatesInput[]
    OR?: TrainingAttachmentScalarWhereWithAggregatesInput[]
    NOT?: TrainingAttachmentScalarWhereWithAggregatesInput | TrainingAttachmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TrainingAttachment"> | string
    pageId?: StringWithAggregatesFilter<"TrainingAttachment"> | string
    name?: StringWithAggregatesFilter<"TrainingAttachment"> | string
    url?: StringWithAggregatesFilter<"TrainingAttachment"> | string
    size?: IntWithAggregatesFilter<"TrainingAttachment"> | number
    type?: StringWithAggregatesFilter<"TrainingAttachment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"TrainingAttachment"> | Date | string
  }

  export type TrainingCategoryCreateInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    modules?: TrainingModuleCreateNestedManyWithoutCategoryInput
  }

  export type TrainingCategoryUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    modules?: TrainingModuleUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type TrainingCategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modules?: TrainingModuleUpdateManyWithoutCategoryNestedInput
  }

  export type TrainingCategoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modules?: TrainingModuleUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type TrainingCategoryCreateManyInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingCategoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingCategoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingModuleCreateInput = {
    id?: string
    title: string
    description?: string | null
    cover?: string | null
    role?: string
    isPublished?: boolean
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: TrainingCategoryCreateNestedOneWithoutModulesInput
    topics?: TrainingTopicCreateNestedManyWithoutModuleInput
  }

  export type TrainingModuleUncheckedCreateInput = {
    id?: string
    title: string
    description?: string | null
    cover?: string | null
    role?: string
    categoryId?: string | null
    isPublished?: boolean
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    topics?: TrainingTopicUncheckedCreateNestedManyWithoutModuleInput
  }

  export type TrainingModuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: TrainingCategoryUpdateOneWithoutModulesNestedInput
    topics?: TrainingTopicUpdateManyWithoutModuleNestedInput
  }

  export type TrainingModuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topics?: TrainingTopicUncheckedUpdateManyWithoutModuleNestedInput
  }

  export type TrainingModuleCreateManyInput = {
    id?: string
    title: string
    description?: string | null
    cover?: string | null
    role?: string
    categoryId?: string | null
    isPublished?: boolean
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingModuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingModuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingTopicCreateInput = {
    id?: string
    title: string
    description?: string | null
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    module: TrainingModuleCreateNestedOneWithoutTopicsInput
    pages?: TrainingPageCreateNestedManyWithoutTopicInput
  }

  export type TrainingTopicUncheckedCreateInput = {
    id?: string
    moduleId: string
    title: string
    description?: string | null
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    pages?: TrainingPageUncheckedCreateNestedManyWithoutTopicInput
  }

  export type TrainingTopicUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    module?: TrainingModuleUpdateOneRequiredWithoutTopicsNestedInput
    pages?: TrainingPageUpdateManyWithoutTopicNestedInput
  }

  export type TrainingTopicUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pages?: TrainingPageUncheckedUpdateManyWithoutTopicNestedInput
  }

  export type TrainingTopicCreateManyInput = {
    id?: string
    moduleId: string
    title: string
    description?: string | null
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingTopicUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingTopicUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingPageCreateInput = {
    id?: string
    title: string
    content: string
    order?: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    topic: TrainingTopicCreateNestedOneWithoutPagesInput
    attachments?: TrainingAttachmentCreateNestedManyWithoutPageInput
  }

  export type TrainingPageUncheckedCreateInput = {
    id?: string
    topicId: string
    title: string
    content: string
    order?: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    attachments?: TrainingAttachmentUncheckedCreateNestedManyWithoutPageInput
  }

  export type TrainingPageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topic?: TrainingTopicUpdateOneRequiredWithoutPagesNestedInput
    attachments?: TrainingAttachmentUpdateManyWithoutPageNestedInput
  }

  export type TrainingPageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    topicId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attachments?: TrainingAttachmentUncheckedUpdateManyWithoutPageNestedInput
  }

  export type TrainingPageCreateManyInput = {
    id?: string
    topicId: string
    title: string
    content: string
    order?: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingPageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingPageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    topicId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingAttachmentCreateInput = {
    id?: string
    name: string
    url: string
    size?: number
    type?: string
    createdAt?: Date | string
    page: TrainingPageCreateNestedOneWithoutAttachmentsInput
  }

  export type TrainingAttachmentUncheckedCreateInput = {
    id?: string
    pageId: string
    name: string
    url: string
    size?: number
    type?: string
    createdAt?: Date | string
  }

  export type TrainingAttachmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    page?: TrainingPageUpdateOneRequiredWithoutAttachmentsNestedInput
  }

  export type TrainingAttachmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    pageId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingAttachmentCreateManyInput = {
    id?: string
    pageId: string
    name: string
    url: string
    size?: number
    type?: string
    createdAt?: Date | string
  }

  export type TrainingAttachmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingAttachmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    pageId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type TrainingModuleListRelationFilter = {
    every?: TrainingModuleWhereInput
    some?: TrainingModuleWhereInput
    none?: TrainingModuleWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type TrainingModuleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TrainingCategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingCategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type TrainingCategoryNullableRelationFilter = {
    is?: TrainingCategoryWhereInput | null
    isNot?: TrainingCategoryWhereInput | null
  }

  export type TrainingTopicListRelationFilter = {
    every?: TrainingTopicWhereInput
    some?: TrainingTopicWhereInput
    none?: TrainingTopicWhereInput
  }

  export type TrainingTopicOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TrainingModuleCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    cover?: SortOrder
    role?: SortOrder
    categoryId?: SortOrder
    isPublished?: SortOrder
    slug?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingModuleAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type TrainingModuleMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    cover?: SortOrder
    role?: SortOrder
    categoryId?: SortOrder
    isPublished?: SortOrder
    slug?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingModuleMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    cover?: SortOrder
    role?: SortOrder
    categoryId?: SortOrder
    isPublished?: SortOrder
    slug?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingModuleSumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type TrainingModuleRelationFilter = {
    is?: TrainingModuleWhereInput
    isNot?: TrainingModuleWhereInput
  }

  export type TrainingPageListRelationFilter = {
    every?: TrainingPageWhereInput
    some?: TrainingPageWhereInput
    none?: TrainingPageWhereInput
  }

  export type TrainingPageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TrainingTopicCountOrderByAggregateInput = {
    id?: SortOrder
    moduleId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingTopicAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type TrainingTopicMaxOrderByAggregateInput = {
    id?: SortOrder
    moduleId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingTopicMinOrderByAggregateInput = {
    id?: SortOrder
    moduleId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingTopicSumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type TrainingTopicRelationFilter = {
    is?: TrainingTopicWhereInput
    isNot?: TrainingTopicWhereInput
  }

  export type TrainingAttachmentListRelationFilter = {
    every?: TrainingAttachmentWhereInput
    some?: TrainingAttachmentWhereInput
    none?: TrainingAttachmentWhereInput
  }

  export type TrainingAttachmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TrainingPageCountOrderByAggregateInput = {
    id?: SortOrder
    topicId?: SortOrder
    title?: SortOrder
    content?: SortOrder
    order?: SortOrder
    isPublished?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingPageAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type TrainingPageMaxOrderByAggregateInput = {
    id?: SortOrder
    topicId?: SortOrder
    title?: SortOrder
    content?: SortOrder
    order?: SortOrder
    isPublished?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingPageMinOrderByAggregateInput = {
    id?: SortOrder
    topicId?: SortOrder
    title?: SortOrder
    content?: SortOrder
    order?: SortOrder
    isPublished?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingPageSumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type TrainingPageRelationFilter = {
    is?: TrainingPageWhereInput
    isNot?: TrainingPageWhereInput
  }

  export type TrainingAttachmentCountOrderByAggregateInput = {
    id?: SortOrder
    pageId?: SortOrder
    name?: SortOrder
    url?: SortOrder
    size?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
  }

  export type TrainingAttachmentAvgOrderByAggregateInput = {
    size?: SortOrder
  }

  export type TrainingAttachmentMaxOrderByAggregateInput = {
    id?: SortOrder
    pageId?: SortOrder
    name?: SortOrder
    url?: SortOrder
    size?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
  }

  export type TrainingAttachmentMinOrderByAggregateInput = {
    id?: SortOrder
    pageId?: SortOrder
    name?: SortOrder
    url?: SortOrder
    size?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
  }

  export type TrainingAttachmentSumOrderByAggregateInput = {
    size?: SortOrder
  }

  export type TrainingModuleCreateNestedManyWithoutCategoryInput = {
    create?: XOR<TrainingModuleCreateWithoutCategoryInput, TrainingModuleUncheckedCreateWithoutCategoryInput> | TrainingModuleCreateWithoutCategoryInput[] | TrainingModuleUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: TrainingModuleCreateOrConnectWithoutCategoryInput | TrainingModuleCreateOrConnectWithoutCategoryInput[]
    createMany?: TrainingModuleCreateManyCategoryInputEnvelope
    connect?: TrainingModuleWhereUniqueInput | TrainingModuleWhereUniqueInput[]
  }

  export type TrainingModuleUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<TrainingModuleCreateWithoutCategoryInput, TrainingModuleUncheckedCreateWithoutCategoryInput> | TrainingModuleCreateWithoutCategoryInput[] | TrainingModuleUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: TrainingModuleCreateOrConnectWithoutCategoryInput | TrainingModuleCreateOrConnectWithoutCategoryInput[]
    createMany?: TrainingModuleCreateManyCategoryInputEnvelope
    connect?: TrainingModuleWhereUniqueInput | TrainingModuleWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type TrainingModuleUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<TrainingModuleCreateWithoutCategoryInput, TrainingModuleUncheckedCreateWithoutCategoryInput> | TrainingModuleCreateWithoutCategoryInput[] | TrainingModuleUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: TrainingModuleCreateOrConnectWithoutCategoryInput | TrainingModuleCreateOrConnectWithoutCategoryInput[]
    upsert?: TrainingModuleUpsertWithWhereUniqueWithoutCategoryInput | TrainingModuleUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: TrainingModuleCreateManyCategoryInputEnvelope
    set?: TrainingModuleWhereUniqueInput | TrainingModuleWhereUniqueInput[]
    disconnect?: TrainingModuleWhereUniqueInput | TrainingModuleWhereUniqueInput[]
    delete?: TrainingModuleWhereUniqueInput | TrainingModuleWhereUniqueInput[]
    connect?: TrainingModuleWhereUniqueInput | TrainingModuleWhereUniqueInput[]
    update?: TrainingModuleUpdateWithWhereUniqueWithoutCategoryInput | TrainingModuleUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: TrainingModuleUpdateManyWithWhereWithoutCategoryInput | TrainingModuleUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: TrainingModuleScalarWhereInput | TrainingModuleScalarWhereInput[]
  }

  export type TrainingModuleUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<TrainingModuleCreateWithoutCategoryInput, TrainingModuleUncheckedCreateWithoutCategoryInput> | TrainingModuleCreateWithoutCategoryInput[] | TrainingModuleUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: TrainingModuleCreateOrConnectWithoutCategoryInput | TrainingModuleCreateOrConnectWithoutCategoryInput[]
    upsert?: TrainingModuleUpsertWithWhereUniqueWithoutCategoryInput | TrainingModuleUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: TrainingModuleCreateManyCategoryInputEnvelope
    set?: TrainingModuleWhereUniqueInput | TrainingModuleWhereUniqueInput[]
    disconnect?: TrainingModuleWhereUniqueInput | TrainingModuleWhereUniqueInput[]
    delete?: TrainingModuleWhereUniqueInput | TrainingModuleWhereUniqueInput[]
    connect?: TrainingModuleWhereUniqueInput | TrainingModuleWhereUniqueInput[]
    update?: TrainingModuleUpdateWithWhereUniqueWithoutCategoryInput | TrainingModuleUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: TrainingModuleUpdateManyWithWhereWithoutCategoryInput | TrainingModuleUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: TrainingModuleScalarWhereInput | TrainingModuleScalarWhereInput[]
  }

  export type TrainingCategoryCreateNestedOneWithoutModulesInput = {
    create?: XOR<TrainingCategoryCreateWithoutModulesInput, TrainingCategoryUncheckedCreateWithoutModulesInput>
    connectOrCreate?: TrainingCategoryCreateOrConnectWithoutModulesInput
    connect?: TrainingCategoryWhereUniqueInput
  }

  export type TrainingTopicCreateNestedManyWithoutModuleInput = {
    create?: XOR<TrainingTopicCreateWithoutModuleInput, TrainingTopicUncheckedCreateWithoutModuleInput> | TrainingTopicCreateWithoutModuleInput[] | TrainingTopicUncheckedCreateWithoutModuleInput[]
    connectOrCreate?: TrainingTopicCreateOrConnectWithoutModuleInput | TrainingTopicCreateOrConnectWithoutModuleInput[]
    createMany?: TrainingTopicCreateManyModuleInputEnvelope
    connect?: TrainingTopicWhereUniqueInput | TrainingTopicWhereUniqueInput[]
  }

  export type TrainingTopicUncheckedCreateNestedManyWithoutModuleInput = {
    create?: XOR<TrainingTopicCreateWithoutModuleInput, TrainingTopicUncheckedCreateWithoutModuleInput> | TrainingTopicCreateWithoutModuleInput[] | TrainingTopicUncheckedCreateWithoutModuleInput[]
    connectOrCreate?: TrainingTopicCreateOrConnectWithoutModuleInput | TrainingTopicCreateOrConnectWithoutModuleInput[]
    createMany?: TrainingTopicCreateManyModuleInputEnvelope
    connect?: TrainingTopicWhereUniqueInput | TrainingTopicWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type TrainingCategoryUpdateOneWithoutModulesNestedInput = {
    create?: XOR<TrainingCategoryCreateWithoutModulesInput, TrainingCategoryUncheckedCreateWithoutModulesInput>
    connectOrCreate?: TrainingCategoryCreateOrConnectWithoutModulesInput
    upsert?: TrainingCategoryUpsertWithoutModulesInput
    disconnect?: TrainingCategoryWhereInput | boolean
    delete?: TrainingCategoryWhereInput | boolean
    connect?: TrainingCategoryWhereUniqueInput
    update?: XOR<XOR<TrainingCategoryUpdateToOneWithWhereWithoutModulesInput, TrainingCategoryUpdateWithoutModulesInput>, TrainingCategoryUncheckedUpdateWithoutModulesInput>
  }

  export type TrainingTopicUpdateManyWithoutModuleNestedInput = {
    create?: XOR<TrainingTopicCreateWithoutModuleInput, TrainingTopicUncheckedCreateWithoutModuleInput> | TrainingTopicCreateWithoutModuleInput[] | TrainingTopicUncheckedCreateWithoutModuleInput[]
    connectOrCreate?: TrainingTopicCreateOrConnectWithoutModuleInput | TrainingTopicCreateOrConnectWithoutModuleInput[]
    upsert?: TrainingTopicUpsertWithWhereUniqueWithoutModuleInput | TrainingTopicUpsertWithWhereUniqueWithoutModuleInput[]
    createMany?: TrainingTopicCreateManyModuleInputEnvelope
    set?: TrainingTopicWhereUniqueInput | TrainingTopicWhereUniqueInput[]
    disconnect?: TrainingTopicWhereUniqueInput | TrainingTopicWhereUniqueInput[]
    delete?: TrainingTopicWhereUniqueInput | TrainingTopicWhereUniqueInput[]
    connect?: TrainingTopicWhereUniqueInput | TrainingTopicWhereUniqueInput[]
    update?: TrainingTopicUpdateWithWhereUniqueWithoutModuleInput | TrainingTopicUpdateWithWhereUniqueWithoutModuleInput[]
    updateMany?: TrainingTopicUpdateManyWithWhereWithoutModuleInput | TrainingTopicUpdateManyWithWhereWithoutModuleInput[]
    deleteMany?: TrainingTopicScalarWhereInput | TrainingTopicScalarWhereInput[]
  }

  export type TrainingTopicUncheckedUpdateManyWithoutModuleNestedInput = {
    create?: XOR<TrainingTopicCreateWithoutModuleInput, TrainingTopicUncheckedCreateWithoutModuleInput> | TrainingTopicCreateWithoutModuleInput[] | TrainingTopicUncheckedCreateWithoutModuleInput[]
    connectOrCreate?: TrainingTopicCreateOrConnectWithoutModuleInput | TrainingTopicCreateOrConnectWithoutModuleInput[]
    upsert?: TrainingTopicUpsertWithWhereUniqueWithoutModuleInput | TrainingTopicUpsertWithWhereUniqueWithoutModuleInput[]
    createMany?: TrainingTopicCreateManyModuleInputEnvelope
    set?: TrainingTopicWhereUniqueInput | TrainingTopicWhereUniqueInput[]
    disconnect?: TrainingTopicWhereUniqueInput | TrainingTopicWhereUniqueInput[]
    delete?: TrainingTopicWhereUniqueInput | TrainingTopicWhereUniqueInput[]
    connect?: TrainingTopicWhereUniqueInput | TrainingTopicWhereUniqueInput[]
    update?: TrainingTopicUpdateWithWhereUniqueWithoutModuleInput | TrainingTopicUpdateWithWhereUniqueWithoutModuleInput[]
    updateMany?: TrainingTopicUpdateManyWithWhereWithoutModuleInput | TrainingTopicUpdateManyWithWhereWithoutModuleInput[]
    deleteMany?: TrainingTopicScalarWhereInput | TrainingTopicScalarWhereInput[]
  }

  export type TrainingModuleCreateNestedOneWithoutTopicsInput = {
    create?: XOR<TrainingModuleCreateWithoutTopicsInput, TrainingModuleUncheckedCreateWithoutTopicsInput>
    connectOrCreate?: TrainingModuleCreateOrConnectWithoutTopicsInput
    connect?: TrainingModuleWhereUniqueInput
  }

  export type TrainingPageCreateNestedManyWithoutTopicInput = {
    create?: XOR<TrainingPageCreateWithoutTopicInput, TrainingPageUncheckedCreateWithoutTopicInput> | TrainingPageCreateWithoutTopicInput[] | TrainingPageUncheckedCreateWithoutTopicInput[]
    connectOrCreate?: TrainingPageCreateOrConnectWithoutTopicInput | TrainingPageCreateOrConnectWithoutTopicInput[]
    createMany?: TrainingPageCreateManyTopicInputEnvelope
    connect?: TrainingPageWhereUniqueInput | TrainingPageWhereUniqueInput[]
  }

  export type TrainingPageUncheckedCreateNestedManyWithoutTopicInput = {
    create?: XOR<TrainingPageCreateWithoutTopicInput, TrainingPageUncheckedCreateWithoutTopicInput> | TrainingPageCreateWithoutTopicInput[] | TrainingPageUncheckedCreateWithoutTopicInput[]
    connectOrCreate?: TrainingPageCreateOrConnectWithoutTopicInput | TrainingPageCreateOrConnectWithoutTopicInput[]
    createMany?: TrainingPageCreateManyTopicInputEnvelope
    connect?: TrainingPageWhereUniqueInput | TrainingPageWhereUniqueInput[]
  }

  export type TrainingModuleUpdateOneRequiredWithoutTopicsNestedInput = {
    create?: XOR<TrainingModuleCreateWithoutTopicsInput, TrainingModuleUncheckedCreateWithoutTopicsInput>
    connectOrCreate?: TrainingModuleCreateOrConnectWithoutTopicsInput
    upsert?: TrainingModuleUpsertWithoutTopicsInput
    connect?: TrainingModuleWhereUniqueInput
    update?: XOR<XOR<TrainingModuleUpdateToOneWithWhereWithoutTopicsInput, TrainingModuleUpdateWithoutTopicsInput>, TrainingModuleUncheckedUpdateWithoutTopicsInput>
  }

  export type TrainingPageUpdateManyWithoutTopicNestedInput = {
    create?: XOR<TrainingPageCreateWithoutTopicInput, TrainingPageUncheckedCreateWithoutTopicInput> | TrainingPageCreateWithoutTopicInput[] | TrainingPageUncheckedCreateWithoutTopicInput[]
    connectOrCreate?: TrainingPageCreateOrConnectWithoutTopicInput | TrainingPageCreateOrConnectWithoutTopicInput[]
    upsert?: TrainingPageUpsertWithWhereUniqueWithoutTopicInput | TrainingPageUpsertWithWhereUniqueWithoutTopicInput[]
    createMany?: TrainingPageCreateManyTopicInputEnvelope
    set?: TrainingPageWhereUniqueInput | TrainingPageWhereUniqueInput[]
    disconnect?: TrainingPageWhereUniqueInput | TrainingPageWhereUniqueInput[]
    delete?: TrainingPageWhereUniqueInput | TrainingPageWhereUniqueInput[]
    connect?: TrainingPageWhereUniqueInput | TrainingPageWhereUniqueInput[]
    update?: TrainingPageUpdateWithWhereUniqueWithoutTopicInput | TrainingPageUpdateWithWhereUniqueWithoutTopicInput[]
    updateMany?: TrainingPageUpdateManyWithWhereWithoutTopicInput | TrainingPageUpdateManyWithWhereWithoutTopicInput[]
    deleteMany?: TrainingPageScalarWhereInput | TrainingPageScalarWhereInput[]
  }

  export type TrainingPageUncheckedUpdateManyWithoutTopicNestedInput = {
    create?: XOR<TrainingPageCreateWithoutTopicInput, TrainingPageUncheckedCreateWithoutTopicInput> | TrainingPageCreateWithoutTopicInput[] | TrainingPageUncheckedCreateWithoutTopicInput[]
    connectOrCreate?: TrainingPageCreateOrConnectWithoutTopicInput | TrainingPageCreateOrConnectWithoutTopicInput[]
    upsert?: TrainingPageUpsertWithWhereUniqueWithoutTopicInput | TrainingPageUpsertWithWhereUniqueWithoutTopicInput[]
    createMany?: TrainingPageCreateManyTopicInputEnvelope
    set?: TrainingPageWhereUniqueInput | TrainingPageWhereUniqueInput[]
    disconnect?: TrainingPageWhereUniqueInput | TrainingPageWhereUniqueInput[]
    delete?: TrainingPageWhereUniqueInput | TrainingPageWhereUniqueInput[]
    connect?: TrainingPageWhereUniqueInput | TrainingPageWhereUniqueInput[]
    update?: TrainingPageUpdateWithWhereUniqueWithoutTopicInput | TrainingPageUpdateWithWhereUniqueWithoutTopicInput[]
    updateMany?: TrainingPageUpdateManyWithWhereWithoutTopicInput | TrainingPageUpdateManyWithWhereWithoutTopicInput[]
    deleteMany?: TrainingPageScalarWhereInput | TrainingPageScalarWhereInput[]
  }

  export type TrainingTopicCreateNestedOneWithoutPagesInput = {
    create?: XOR<TrainingTopicCreateWithoutPagesInput, TrainingTopicUncheckedCreateWithoutPagesInput>
    connectOrCreate?: TrainingTopicCreateOrConnectWithoutPagesInput
    connect?: TrainingTopicWhereUniqueInput
  }

  export type TrainingAttachmentCreateNestedManyWithoutPageInput = {
    create?: XOR<TrainingAttachmentCreateWithoutPageInput, TrainingAttachmentUncheckedCreateWithoutPageInput> | TrainingAttachmentCreateWithoutPageInput[] | TrainingAttachmentUncheckedCreateWithoutPageInput[]
    connectOrCreate?: TrainingAttachmentCreateOrConnectWithoutPageInput | TrainingAttachmentCreateOrConnectWithoutPageInput[]
    createMany?: TrainingAttachmentCreateManyPageInputEnvelope
    connect?: TrainingAttachmentWhereUniqueInput | TrainingAttachmentWhereUniqueInput[]
  }

  export type TrainingAttachmentUncheckedCreateNestedManyWithoutPageInput = {
    create?: XOR<TrainingAttachmentCreateWithoutPageInput, TrainingAttachmentUncheckedCreateWithoutPageInput> | TrainingAttachmentCreateWithoutPageInput[] | TrainingAttachmentUncheckedCreateWithoutPageInput[]
    connectOrCreate?: TrainingAttachmentCreateOrConnectWithoutPageInput | TrainingAttachmentCreateOrConnectWithoutPageInput[]
    createMany?: TrainingAttachmentCreateManyPageInputEnvelope
    connect?: TrainingAttachmentWhereUniqueInput | TrainingAttachmentWhereUniqueInput[]
  }

  export type TrainingTopicUpdateOneRequiredWithoutPagesNestedInput = {
    create?: XOR<TrainingTopicCreateWithoutPagesInput, TrainingTopicUncheckedCreateWithoutPagesInput>
    connectOrCreate?: TrainingTopicCreateOrConnectWithoutPagesInput
    upsert?: TrainingTopicUpsertWithoutPagesInput
    connect?: TrainingTopicWhereUniqueInput
    update?: XOR<XOR<TrainingTopicUpdateToOneWithWhereWithoutPagesInput, TrainingTopicUpdateWithoutPagesInput>, TrainingTopicUncheckedUpdateWithoutPagesInput>
  }

  export type TrainingAttachmentUpdateManyWithoutPageNestedInput = {
    create?: XOR<TrainingAttachmentCreateWithoutPageInput, TrainingAttachmentUncheckedCreateWithoutPageInput> | TrainingAttachmentCreateWithoutPageInput[] | TrainingAttachmentUncheckedCreateWithoutPageInput[]
    connectOrCreate?: TrainingAttachmentCreateOrConnectWithoutPageInput | TrainingAttachmentCreateOrConnectWithoutPageInput[]
    upsert?: TrainingAttachmentUpsertWithWhereUniqueWithoutPageInput | TrainingAttachmentUpsertWithWhereUniqueWithoutPageInput[]
    createMany?: TrainingAttachmentCreateManyPageInputEnvelope
    set?: TrainingAttachmentWhereUniqueInput | TrainingAttachmentWhereUniqueInput[]
    disconnect?: TrainingAttachmentWhereUniqueInput | TrainingAttachmentWhereUniqueInput[]
    delete?: TrainingAttachmentWhereUniqueInput | TrainingAttachmentWhereUniqueInput[]
    connect?: TrainingAttachmentWhereUniqueInput | TrainingAttachmentWhereUniqueInput[]
    update?: TrainingAttachmentUpdateWithWhereUniqueWithoutPageInput | TrainingAttachmentUpdateWithWhereUniqueWithoutPageInput[]
    updateMany?: TrainingAttachmentUpdateManyWithWhereWithoutPageInput | TrainingAttachmentUpdateManyWithWhereWithoutPageInput[]
    deleteMany?: TrainingAttachmentScalarWhereInput | TrainingAttachmentScalarWhereInput[]
  }

  export type TrainingAttachmentUncheckedUpdateManyWithoutPageNestedInput = {
    create?: XOR<TrainingAttachmentCreateWithoutPageInput, TrainingAttachmentUncheckedCreateWithoutPageInput> | TrainingAttachmentCreateWithoutPageInput[] | TrainingAttachmentUncheckedCreateWithoutPageInput[]
    connectOrCreate?: TrainingAttachmentCreateOrConnectWithoutPageInput | TrainingAttachmentCreateOrConnectWithoutPageInput[]
    upsert?: TrainingAttachmentUpsertWithWhereUniqueWithoutPageInput | TrainingAttachmentUpsertWithWhereUniqueWithoutPageInput[]
    createMany?: TrainingAttachmentCreateManyPageInputEnvelope
    set?: TrainingAttachmentWhereUniqueInput | TrainingAttachmentWhereUniqueInput[]
    disconnect?: TrainingAttachmentWhereUniqueInput | TrainingAttachmentWhereUniqueInput[]
    delete?: TrainingAttachmentWhereUniqueInput | TrainingAttachmentWhereUniqueInput[]
    connect?: TrainingAttachmentWhereUniqueInput | TrainingAttachmentWhereUniqueInput[]
    update?: TrainingAttachmentUpdateWithWhereUniqueWithoutPageInput | TrainingAttachmentUpdateWithWhereUniqueWithoutPageInput[]
    updateMany?: TrainingAttachmentUpdateManyWithWhereWithoutPageInput | TrainingAttachmentUpdateManyWithWhereWithoutPageInput[]
    deleteMany?: TrainingAttachmentScalarWhereInput | TrainingAttachmentScalarWhereInput[]
  }

  export type TrainingPageCreateNestedOneWithoutAttachmentsInput = {
    create?: XOR<TrainingPageCreateWithoutAttachmentsInput, TrainingPageUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: TrainingPageCreateOrConnectWithoutAttachmentsInput
    connect?: TrainingPageWhereUniqueInput
  }

  export type TrainingPageUpdateOneRequiredWithoutAttachmentsNestedInput = {
    create?: XOR<TrainingPageCreateWithoutAttachmentsInput, TrainingPageUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: TrainingPageCreateOrConnectWithoutAttachmentsInput
    upsert?: TrainingPageUpsertWithoutAttachmentsInput
    connect?: TrainingPageWhereUniqueInput
    update?: XOR<XOR<TrainingPageUpdateToOneWithWhereWithoutAttachmentsInput, TrainingPageUpdateWithoutAttachmentsInput>, TrainingPageUncheckedUpdateWithoutAttachmentsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type TrainingModuleCreateWithoutCategoryInput = {
    id?: string
    title: string
    description?: string | null
    cover?: string | null
    role?: string
    isPublished?: boolean
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    topics?: TrainingTopicCreateNestedManyWithoutModuleInput
  }

  export type TrainingModuleUncheckedCreateWithoutCategoryInput = {
    id?: string
    title: string
    description?: string | null
    cover?: string | null
    role?: string
    isPublished?: boolean
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    topics?: TrainingTopicUncheckedCreateNestedManyWithoutModuleInput
  }

  export type TrainingModuleCreateOrConnectWithoutCategoryInput = {
    where: TrainingModuleWhereUniqueInput
    create: XOR<TrainingModuleCreateWithoutCategoryInput, TrainingModuleUncheckedCreateWithoutCategoryInput>
  }

  export type TrainingModuleCreateManyCategoryInputEnvelope = {
    data: TrainingModuleCreateManyCategoryInput | TrainingModuleCreateManyCategoryInput[]
  }

  export type TrainingModuleUpsertWithWhereUniqueWithoutCategoryInput = {
    where: TrainingModuleWhereUniqueInput
    update: XOR<TrainingModuleUpdateWithoutCategoryInput, TrainingModuleUncheckedUpdateWithoutCategoryInput>
    create: XOR<TrainingModuleCreateWithoutCategoryInput, TrainingModuleUncheckedCreateWithoutCategoryInput>
  }

  export type TrainingModuleUpdateWithWhereUniqueWithoutCategoryInput = {
    where: TrainingModuleWhereUniqueInput
    data: XOR<TrainingModuleUpdateWithoutCategoryInput, TrainingModuleUncheckedUpdateWithoutCategoryInput>
  }

  export type TrainingModuleUpdateManyWithWhereWithoutCategoryInput = {
    where: TrainingModuleScalarWhereInput
    data: XOR<TrainingModuleUpdateManyMutationInput, TrainingModuleUncheckedUpdateManyWithoutCategoryInput>
  }

  export type TrainingModuleScalarWhereInput = {
    AND?: TrainingModuleScalarWhereInput | TrainingModuleScalarWhereInput[]
    OR?: TrainingModuleScalarWhereInput[]
    NOT?: TrainingModuleScalarWhereInput | TrainingModuleScalarWhereInput[]
    id?: StringFilter<"TrainingModule"> | string
    title?: StringFilter<"TrainingModule"> | string
    description?: StringNullableFilter<"TrainingModule"> | string | null
    cover?: StringNullableFilter<"TrainingModule"> | string | null
    role?: StringFilter<"TrainingModule"> | string
    categoryId?: StringNullableFilter<"TrainingModule"> | string | null
    isPublished?: BoolFilter<"TrainingModule"> | boolean
    slug?: StringFilter<"TrainingModule"> | string
    order?: IntFilter<"TrainingModule"> | number
    createdAt?: DateTimeFilter<"TrainingModule"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingModule"> | Date | string
  }

  export type TrainingCategoryCreateWithoutModulesInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingCategoryUncheckedCreateWithoutModulesInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingCategoryCreateOrConnectWithoutModulesInput = {
    where: TrainingCategoryWhereUniqueInput
    create: XOR<TrainingCategoryCreateWithoutModulesInput, TrainingCategoryUncheckedCreateWithoutModulesInput>
  }

  export type TrainingTopicCreateWithoutModuleInput = {
    id?: string
    title: string
    description?: string | null
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    pages?: TrainingPageCreateNestedManyWithoutTopicInput
  }

  export type TrainingTopicUncheckedCreateWithoutModuleInput = {
    id?: string
    title: string
    description?: string | null
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    pages?: TrainingPageUncheckedCreateNestedManyWithoutTopicInput
  }

  export type TrainingTopicCreateOrConnectWithoutModuleInput = {
    where: TrainingTopicWhereUniqueInput
    create: XOR<TrainingTopicCreateWithoutModuleInput, TrainingTopicUncheckedCreateWithoutModuleInput>
  }

  export type TrainingTopicCreateManyModuleInputEnvelope = {
    data: TrainingTopicCreateManyModuleInput | TrainingTopicCreateManyModuleInput[]
  }

  export type TrainingCategoryUpsertWithoutModulesInput = {
    update: XOR<TrainingCategoryUpdateWithoutModulesInput, TrainingCategoryUncheckedUpdateWithoutModulesInput>
    create: XOR<TrainingCategoryCreateWithoutModulesInput, TrainingCategoryUncheckedCreateWithoutModulesInput>
    where?: TrainingCategoryWhereInput
  }

  export type TrainingCategoryUpdateToOneWithWhereWithoutModulesInput = {
    where?: TrainingCategoryWhereInput
    data: XOR<TrainingCategoryUpdateWithoutModulesInput, TrainingCategoryUncheckedUpdateWithoutModulesInput>
  }

  export type TrainingCategoryUpdateWithoutModulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingCategoryUncheckedUpdateWithoutModulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingTopicUpsertWithWhereUniqueWithoutModuleInput = {
    where: TrainingTopicWhereUniqueInput
    update: XOR<TrainingTopicUpdateWithoutModuleInput, TrainingTopicUncheckedUpdateWithoutModuleInput>
    create: XOR<TrainingTopicCreateWithoutModuleInput, TrainingTopicUncheckedCreateWithoutModuleInput>
  }

  export type TrainingTopicUpdateWithWhereUniqueWithoutModuleInput = {
    where: TrainingTopicWhereUniqueInput
    data: XOR<TrainingTopicUpdateWithoutModuleInput, TrainingTopicUncheckedUpdateWithoutModuleInput>
  }

  export type TrainingTopicUpdateManyWithWhereWithoutModuleInput = {
    where: TrainingTopicScalarWhereInput
    data: XOR<TrainingTopicUpdateManyMutationInput, TrainingTopicUncheckedUpdateManyWithoutModuleInput>
  }

  export type TrainingTopicScalarWhereInput = {
    AND?: TrainingTopicScalarWhereInput | TrainingTopicScalarWhereInput[]
    OR?: TrainingTopicScalarWhereInput[]
    NOT?: TrainingTopicScalarWhereInput | TrainingTopicScalarWhereInput[]
    id?: StringFilter<"TrainingTopic"> | string
    moduleId?: StringFilter<"TrainingTopic"> | string
    title?: StringFilter<"TrainingTopic"> | string
    description?: StringNullableFilter<"TrainingTopic"> | string | null
    order?: IntFilter<"TrainingTopic"> | number
    createdAt?: DateTimeFilter<"TrainingTopic"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingTopic"> | Date | string
  }

  export type TrainingModuleCreateWithoutTopicsInput = {
    id?: string
    title: string
    description?: string | null
    cover?: string | null
    role?: string
    isPublished?: boolean
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: TrainingCategoryCreateNestedOneWithoutModulesInput
  }

  export type TrainingModuleUncheckedCreateWithoutTopicsInput = {
    id?: string
    title: string
    description?: string | null
    cover?: string | null
    role?: string
    categoryId?: string | null
    isPublished?: boolean
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingModuleCreateOrConnectWithoutTopicsInput = {
    where: TrainingModuleWhereUniqueInput
    create: XOR<TrainingModuleCreateWithoutTopicsInput, TrainingModuleUncheckedCreateWithoutTopicsInput>
  }

  export type TrainingPageCreateWithoutTopicInput = {
    id?: string
    title: string
    content: string
    order?: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    attachments?: TrainingAttachmentCreateNestedManyWithoutPageInput
  }

  export type TrainingPageUncheckedCreateWithoutTopicInput = {
    id?: string
    title: string
    content: string
    order?: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    attachments?: TrainingAttachmentUncheckedCreateNestedManyWithoutPageInput
  }

  export type TrainingPageCreateOrConnectWithoutTopicInput = {
    where: TrainingPageWhereUniqueInput
    create: XOR<TrainingPageCreateWithoutTopicInput, TrainingPageUncheckedCreateWithoutTopicInput>
  }

  export type TrainingPageCreateManyTopicInputEnvelope = {
    data: TrainingPageCreateManyTopicInput | TrainingPageCreateManyTopicInput[]
  }

  export type TrainingModuleUpsertWithoutTopicsInput = {
    update: XOR<TrainingModuleUpdateWithoutTopicsInput, TrainingModuleUncheckedUpdateWithoutTopicsInput>
    create: XOR<TrainingModuleCreateWithoutTopicsInput, TrainingModuleUncheckedCreateWithoutTopicsInput>
    where?: TrainingModuleWhereInput
  }

  export type TrainingModuleUpdateToOneWithWhereWithoutTopicsInput = {
    where?: TrainingModuleWhereInput
    data: XOR<TrainingModuleUpdateWithoutTopicsInput, TrainingModuleUncheckedUpdateWithoutTopicsInput>
  }

  export type TrainingModuleUpdateWithoutTopicsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: TrainingCategoryUpdateOneWithoutModulesNestedInput
  }

  export type TrainingModuleUncheckedUpdateWithoutTopicsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingPageUpsertWithWhereUniqueWithoutTopicInput = {
    where: TrainingPageWhereUniqueInput
    update: XOR<TrainingPageUpdateWithoutTopicInput, TrainingPageUncheckedUpdateWithoutTopicInput>
    create: XOR<TrainingPageCreateWithoutTopicInput, TrainingPageUncheckedCreateWithoutTopicInput>
  }

  export type TrainingPageUpdateWithWhereUniqueWithoutTopicInput = {
    where: TrainingPageWhereUniqueInput
    data: XOR<TrainingPageUpdateWithoutTopicInput, TrainingPageUncheckedUpdateWithoutTopicInput>
  }

  export type TrainingPageUpdateManyWithWhereWithoutTopicInput = {
    where: TrainingPageScalarWhereInput
    data: XOR<TrainingPageUpdateManyMutationInput, TrainingPageUncheckedUpdateManyWithoutTopicInput>
  }

  export type TrainingPageScalarWhereInput = {
    AND?: TrainingPageScalarWhereInput | TrainingPageScalarWhereInput[]
    OR?: TrainingPageScalarWhereInput[]
    NOT?: TrainingPageScalarWhereInput | TrainingPageScalarWhereInput[]
    id?: StringFilter<"TrainingPage"> | string
    topicId?: StringFilter<"TrainingPage"> | string
    title?: StringFilter<"TrainingPage"> | string
    content?: StringFilter<"TrainingPage"> | string
    order?: IntFilter<"TrainingPage"> | number
    isPublished?: BoolFilter<"TrainingPage"> | boolean
    createdAt?: DateTimeFilter<"TrainingPage"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingPage"> | Date | string
  }

  export type TrainingTopicCreateWithoutPagesInput = {
    id?: string
    title: string
    description?: string | null
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    module: TrainingModuleCreateNestedOneWithoutTopicsInput
  }

  export type TrainingTopicUncheckedCreateWithoutPagesInput = {
    id?: string
    moduleId: string
    title: string
    description?: string | null
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingTopicCreateOrConnectWithoutPagesInput = {
    where: TrainingTopicWhereUniqueInput
    create: XOR<TrainingTopicCreateWithoutPagesInput, TrainingTopicUncheckedCreateWithoutPagesInput>
  }

  export type TrainingAttachmentCreateWithoutPageInput = {
    id?: string
    name: string
    url: string
    size?: number
    type?: string
    createdAt?: Date | string
  }

  export type TrainingAttachmentUncheckedCreateWithoutPageInput = {
    id?: string
    name: string
    url: string
    size?: number
    type?: string
    createdAt?: Date | string
  }

  export type TrainingAttachmentCreateOrConnectWithoutPageInput = {
    where: TrainingAttachmentWhereUniqueInput
    create: XOR<TrainingAttachmentCreateWithoutPageInput, TrainingAttachmentUncheckedCreateWithoutPageInput>
  }

  export type TrainingAttachmentCreateManyPageInputEnvelope = {
    data: TrainingAttachmentCreateManyPageInput | TrainingAttachmentCreateManyPageInput[]
  }

  export type TrainingTopicUpsertWithoutPagesInput = {
    update: XOR<TrainingTopicUpdateWithoutPagesInput, TrainingTopicUncheckedUpdateWithoutPagesInput>
    create: XOR<TrainingTopicCreateWithoutPagesInput, TrainingTopicUncheckedCreateWithoutPagesInput>
    where?: TrainingTopicWhereInput
  }

  export type TrainingTopicUpdateToOneWithWhereWithoutPagesInput = {
    where?: TrainingTopicWhereInput
    data: XOR<TrainingTopicUpdateWithoutPagesInput, TrainingTopicUncheckedUpdateWithoutPagesInput>
  }

  export type TrainingTopicUpdateWithoutPagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    module?: TrainingModuleUpdateOneRequiredWithoutTopicsNestedInput
  }

  export type TrainingTopicUncheckedUpdateWithoutPagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingAttachmentUpsertWithWhereUniqueWithoutPageInput = {
    where: TrainingAttachmentWhereUniqueInput
    update: XOR<TrainingAttachmentUpdateWithoutPageInput, TrainingAttachmentUncheckedUpdateWithoutPageInput>
    create: XOR<TrainingAttachmentCreateWithoutPageInput, TrainingAttachmentUncheckedCreateWithoutPageInput>
  }

  export type TrainingAttachmentUpdateWithWhereUniqueWithoutPageInput = {
    where: TrainingAttachmentWhereUniqueInput
    data: XOR<TrainingAttachmentUpdateWithoutPageInput, TrainingAttachmentUncheckedUpdateWithoutPageInput>
  }

  export type TrainingAttachmentUpdateManyWithWhereWithoutPageInput = {
    where: TrainingAttachmentScalarWhereInput
    data: XOR<TrainingAttachmentUpdateManyMutationInput, TrainingAttachmentUncheckedUpdateManyWithoutPageInput>
  }

  export type TrainingAttachmentScalarWhereInput = {
    AND?: TrainingAttachmentScalarWhereInput | TrainingAttachmentScalarWhereInput[]
    OR?: TrainingAttachmentScalarWhereInput[]
    NOT?: TrainingAttachmentScalarWhereInput | TrainingAttachmentScalarWhereInput[]
    id?: StringFilter<"TrainingAttachment"> | string
    pageId?: StringFilter<"TrainingAttachment"> | string
    name?: StringFilter<"TrainingAttachment"> | string
    url?: StringFilter<"TrainingAttachment"> | string
    size?: IntFilter<"TrainingAttachment"> | number
    type?: StringFilter<"TrainingAttachment"> | string
    createdAt?: DateTimeFilter<"TrainingAttachment"> | Date | string
  }

  export type TrainingPageCreateWithoutAttachmentsInput = {
    id?: string
    title: string
    content: string
    order?: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    topic: TrainingTopicCreateNestedOneWithoutPagesInput
  }

  export type TrainingPageUncheckedCreateWithoutAttachmentsInput = {
    id?: string
    topicId: string
    title: string
    content: string
    order?: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingPageCreateOrConnectWithoutAttachmentsInput = {
    where: TrainingPageWhereUniqueInput
    create: XOR<TrainingPageCreateWithoutAttachmentsInput, TrainingPageUncheckedCreateWithoutAttachmentsInput>
  }

  export type TrainingPageUpsertWithoutAttachmentsInput = {
    update: XOR<TrainingPageUpdateWithoutAttachmentsInput, TrainingPageUncheckedUpdateWithoutAttachmentsInput>
    create: XOR<TrainingPageCreateWithoutAttachmentsInput, TrainingPageUncheckedCreateWithoutAttachmentsInput>
    where?: TrainingPageWhereInput
  }

  export type TrainingPageUpdateToOneWithWhereWithoutAttachmentsInput = {
    where?: TrainingPageWhereInput
    data: XOR<TrainingPageUpdateWithoutAttachmentsInput, TrainingPageUncheckedUpdateWithoutAttachmentsInput>
  }

  export type TrainingPageUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topic?: TrainingTopicUpdateOneRequiredWithoutPagesNestedInput
  }

  export type TrainingPageUncheckedUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    topicId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingModuleCreateManyCategoryInput = {
    id?: string
    title: string
    description?: string | null
    cover?: string | null
    role?: string
    isPublished?: boolean
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingModuleUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topics?: TrainingTopicUpdateManyWithoutModuleNestedInput
  }

  export type TrainingModuleUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topics?: TrainingTopicUncheckedUpdateManyWithoutModuleNestedInput
  }

  export type TrainingModuleUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingTopicCreateManyModuleInput = {
    id?: string
    title: string
    description?: string | null
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingTopicUpdateWithoutModuleInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pages?: TrainingPageUpdateManyWithoutTopicNestedInput
  }

  export type TrainingTopicUncheckedUpdateWithoutModuleInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pages?: TrainingPageUncheckedUpdateManyWithoutTopicNestedInput
  }

  export type TrainingTopicUncheckedUpdateManyWithoutModuleInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingPageCreateManyTopicInput = {
    id?: string
    title: string
    content: string
    order?: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingPageUpdateWithoutTopicInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attachments?: TrainingAttachmentUpdateManyWithoutPageNestedInput
  }

  export type TrainingPageUncheckedUpdateWithoutTopicInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attachments?: TrainingAttachmentUncheckedUpdateManyWithoutPageNestedInput
  }

  export type TrainingPageUncheckedUpdateManyWithoutTopicInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingAttachmentCreateManyPageInput = {
    id?: string
    name: string
    url: string
    size?: number
    type?: string
    createdAt?: Date | string
  }

  export type TrainingAttachmentUpdateWithoutPageInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingAttachmentUncheckedUpdateWithoutPageInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingAttachmentUncheckedUpdateManyWithoutPageInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use TrainingCategoryCountOutputTypeDefaultArgs instead
     */
    export type TrainingCategoryCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrainingCategoryCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrainingModuleCountOutputTypeDefaultArgs instead
     */
    export type TrainingModuleCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrainingModuleCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrainingTopicCountOutputTypeDefaultArgs instead
     */
    export type TrainingTopicCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrainingTopicCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrainingPageCountOutputTypeDefaultArgs instead
     */
    export type TrainingPageCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrainingPageCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrainingCategoryDefaultArgs instead
     */
    export type TrainingCategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrainingCategoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrainingModuleDefaultArgs instead
     */
    export type TrainingModuleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrainingModuleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrainingTopicDefaultArgs instead
     */
    export type TrainingTopicArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrainingTopicDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrainingPageDefaultArgs instead
     */
    export type TrainingPageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrainingPageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrainingAttachmentDefaultArgs instead
     */
    export type TrainingAttachmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrainingAttachmentDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}