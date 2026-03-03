// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'finance_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$financeSnapshotDataHash() =>
    r'1ddd12c9e606b1cb063d0c4a9a932a74230597a5';

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

abstract class _$FinanceSnapshotData
    extends BuildlessAutoDisposeAsyncNotifier<Map<String, dynamic>> {
  late final String studentId;

  FutureOr<Map<String, dynamic>> build(
    String studentId,
  );
}

/// See also [FinanceSnapshotData].
@ProviderFor(FinanceSnapshotData)
const financeSnapshotDataProvider = FinanceSnapshotDataFamily();

/// See also [FinanceSnapshotData].
class FinanceSnapshotDataFamily
    extends Family<AsyncValue<Map<String, dynamic>>> {
  /// See also [FinanceSnapshotData].
  const FinanceSnapshotDataFamily();

  /// See also [FinanceSnapshotData].
  FinanceSnapshotDataProvider call(
    String studentId,
  ) {
    return FinanceSnapshotDataProvider(
      studentId,
    );
  }

  @override
  FinanceSnapshotDataProvider getProviderOverride(
    covariant FinanceSnapshotDataProvider provider,
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
  String? get name => r'financeSnapshotDataProvider';
}

/// See also [FinanceSnapshotData].
class FinanceSnapshotDataProvider extends AutoDisposeAsyncNotifierProviderImpl<
    FinanceSnapshotData, Map<String, dynamic>> {
  /// See also [FinanceSnapshotData].
  FinanceSnapshotDataProvider(
    String studentId,
  ) : this._internal(
          () => FinanceSnapshotData()..studentId = studentId,
          from: financeSnapshotDataProvider,
          name: r'financeSnapshotDataProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$financeSnapshotDataHash,
          dependencies: FinanceSnapshotDataFamily._dependencies,
          allTransitiveDependencies:
              FinanceSnapshotDataFamily._allTransitiveDependencies,
          studentId: studentId,
        );

  FinanceSnapshotDataProvider._internal(
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
    covariant FinanceSnapshotData notifier,
  ) {
    return notifier.build(
      studentId,
    );
  }

  @override
  Override overrideWith(FinanceSnapshotData Function() create) {
    return ProviderOverride(
      origin: this,
      override: FinanceSnapshotDataProvider._internal(
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
  AutoDisposeAsyncNotifierProviderElement<FinanceSnapshotData,
      Map<String, dynamic>> createElement() {
    return _FinanceSnapshotDataProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is FinanceSnapshotDataProvider && other.studentId == studentId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, studentId.hashCode);

    return _SystemHash.finish(hash);
  }
}

mixin FinanceSnapshotDataRef
    on AutoDisposeAsyncNotifierProviderRef<Map<String, dynamic>> {
  /// The parameter `studentId` of this provider.
  String get studentId;
}

class _FinanceSnapshotDataProviderElement
    extends AutoDisposeAsyncNotifierProviderElement<FinanceSnapshotData,
        Map<String, dynamic>> with FinanceSnapshotDataRef {
  _FinanceSnapshotDataProviderElement(super.provider);

  @override
  String get studentId => (origin as FinanceSnapshotDataProvider).studentId;
}
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member
