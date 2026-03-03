// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'transport_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$liveTransportDataHash() => r'172711c1174ae070fbd2d523e5b38626b4f1f002';

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

abstract class _$LiveTransportData
    extends BuildlessAutoDisposeAsyncNotifier<Map<String, dynamic>> {
  late final String studentId;

  FutureOr<Map<String, dynamic>> build(
    String studentId,
  );
}

/// See also [LiveTransportData].
@ProviderFor(LiveTransportData)
const liveTransportDataProvider = LiveTransportDataFamily();

/// See also [LiveTransportData].
class LiveTransportDataFamily extends Family<AsyncValue<Map<String, dynamic>>> {
  /// See also [LiveTransportData].
  const LiveTransportDataFamily();

  /// See also [LiveTransportData].
  LiveTransportDataProvider call(
    String studentId,
  ) {
    return LiveTransportDataProvider(
      studentId,
    );
  }

  @override
  LiveTransportDataProvider getProviderOverride(
    covariant LiveTransportDataProvider provider,
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
  String? get name => r'liveTransportDataProvider';
}

/// See also [LiveTransportData].
class LiveTransportDataProvider extends AutoDisposeAsyncNotifierProviderImpl<
    LiveTransportData, Map<String, dynamic>> {
  /// See also [LiveTransportData].
  LiveTransportDataProvider(
    String studentId,
  ) : this._internal(
          () => LiveTransportData()..studentId = studentId,
          from: liveTransportDataProvider,
          name: r'liveTransportDataProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$liveTransportDataHash,
          dependencies: LiveTransportDataFamily._dependencies,
          allTransitiveDependencies:
              LiveTransportDataFamily._allTransitiveDependencies,
          studentId: studentId,
        );

  LiveTransportDataProvider._internal(
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
    covariant LiveTransportData notifier,
  ) {
    return notifier.build(
      studentId,
    );
  }

  @override
  Override overrideWith(LiveTransportData Function() create) {
    return ProviderOverride(
      origin: this,
      override: LiveTransportDataProvider._internal(
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
  AutoDisposeAsyncNotifierProviderElement<LiveTransportData,
      Map<String, dynamic>> createElement() {
    return _LiveTransportDataProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is LiveTransportDataProvider && other.studentId == studentId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, studentId.hashCode);

    return _SystemHash.finish(hash);
  }
}

mixin LiveTransportDataRef
    on AutoDisposeAsyncNotifierProviderRef<Map<String, dynamic>> {
  /// The parameter `studentId` of this provider.
  String get studentId;
}

class _LiveTransportDataProviderElement
    extends AutoDisposeAsyncNotifierProviderElement<LiveTransportData,
        Map<String, dynamic>> with LiveTransportDataRef {
  _LiveTransportDataProviderElement(super.provider);

  @override
  String get studentId => (origin as LiveTransportDataProvider).studentId;
}
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member
