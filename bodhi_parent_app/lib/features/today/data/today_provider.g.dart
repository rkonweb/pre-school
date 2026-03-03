// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'today_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$todayTimelineDataHash() => r'4be8f1430fd890cad07efe732653b5f6c9f4b9c1';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

abstract class _$TodayTimelineData
    extends BuildlessAutoDisposeAsyncNotifier<Map<String, dynamic>> {
  late final String studentId;

  FutureOr<Map<String, dynamic>> build(
    String studentId,
  );
}

/// See also [TodayTimelineData].
@ProviderFor(TodayTimelineData)
const todayTimelineDataProvider = TodayTimelineDataFamily();

/// See also [TodayTimelineData].
class TodayTimelineDataFamily extends Family<AsyncValue<Map<String, dynamic>>> {
  /// See also [TodayTimelineData].
  const TodayTimelineDataFamily();

  /// See also [TodayTimelineData].
  TodayTimelineDataProvider call(
    String studentId,
  ) {
    return TodayTimelineDataProvider(
      studentId,
    );
  }

  @override
  TodayTimelineDataProvider getProviderOverride(
    covariant TodayTimelineDataProvider provider,
  ) {
    return call(
      provider.studentId,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'todayTimelineDataProvider';
}

/// See also [TodayTimelineData].
class TodayTimelineDataProvider extends AutoDisposeAsyncNotifierProviderImpl<
    TodayTimelineData, Map<String, dynamic>> {
  /// See also [TodayTimelineData].
  TodayTimelineDataProvider(
    String studentId,
  ) : this._internal(
          () => TodayTimelineData()..studentId = studentId,
          from: todayTimelineDataProvider,
          name: r'todayTimelineDataProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$todayTimelineDataHash,
          dependencies: TodayTimelineDataFamily._dependencies,
          allTransitiveDependencies:
              TodayTimelineDataFamily._allTransitiveDependencies,
          studentId: studentId,
        );

  TodayTimelineDataProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.studentId,
  }) : super.internal();

  final String studentId;

  @override
  FutureOr<Map<String, dynamic>> runNotifierBuild(
    covariant TodayTimelineData notifier,
  ) {
    return notifier.build(
      studentId,
    );
  }

  @override
  Override overrideWith(TodayTimelineData Function() create) {
    return ProviderOverride(
      origin: this,
      override: TodayTimelineDataProvider._internal(
        () => create()..studentId = studentId,
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        studentId: studentId,
      ),
    );
  }

  @override
  AutoDisposeAsyncNotifierProviderElement<TodayTimelineData,
      Map<String, dynamic>> createElement() {
    return _TodayTimelineDataProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is TodayTimelineDataProvider && other.studentId == studentId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, studentId.hashCode);

    return _SystemHash.finish(hash);
  }
}

mixin TodayTimelineDataRef
    on AutoDisposeAsyncNotifierProviderRef<Map<String, dynamic>> {
  /// The parameter `studentId` of this provider.
  String get studentId;
}

class _TodayTimelineDataProviderElement
    extends AutoDisposeAsyncNotifierProviderElement<TodayTimelineData,
        Map<String, dynamic>> with TodayTimelineDataRef {
  _TodayTimelineDataProviderElement(super.provider);

  @override
  String get studentId => (origin as TodayTimelineDataProvider).studentId;
}
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member
