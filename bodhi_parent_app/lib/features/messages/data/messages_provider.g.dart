// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'messages_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$messagesThreadDataHash() =>
    r'9f6e8d17cbb59071ffea50a4bbd028ed522fbe6a';

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

abstract class _$MessagesThreadData
    extends BuildlessAutoDisposeAsyncNotifier<Map<String, dynamic>> {
  late final String studentId;

  FutureOr<Map<String, dynamic>> build(
    String studentId,
  );
}

/// See also [MessagesThreadData].
@ProviderFor(MessagesThreadData)
const messagesThreadDataProvider = MessagesThreadDataFamily();

/// See also [MessagesThreadData].
class MessagesThreadDataFamily
    extends Family<AsyncValue<Map<String, dynamic>>> {
  /// See also [MessagesThreadData].
  const MessagesThreadDataFamily();

  /// See also [MessagesThreadData].
  MessagesThreadDataProvider call(
    String studentId,
  ) {
    return MessagesThreadDataProvider(
      studentId,
    );
  }

  @override
  MessagesThreadDataProvider getProviderOverride(
    covariant MessagesThreadDataProvider provider,
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
  String? get name => r'messagesThreadDataProvider';
}

/// See also [MessagesThreadData].
class MessagesThreadDataProvider extends AutoDisposeAsyncNotifierProviderImpl<
    MessagesThreadData, Map<String, dynamic>> {
  /// See also [MessagesThreadData].
  MessagesThreadDataProvider(
    String studentId,
  ) : this._internal(
          () => MessagesThreadData()..studentId = studentId,
          from: messagesThreadDataProvider,
          name: r'messagesThreadDataProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$messagesThreadDataHash,
          dependencies: MessagesThreadDataFamily._dependencies,
          allTransitiveDependencies:
              MessagesThreadDataFamily._allTransitiveDependencies,
          studentId: studentId,
        );

  MessagesThreadDataProvider._internal(
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
    covariant MessagesThreadData notifier,
  ) {
    return notifier.build(
      studentId,
    );
  }

  @override
  Override overrideWith(MessagesThreadData Function() create) {
    return ProviderOverride(
      origin: this,
      override: MessagesThreadDataProvider._internal(
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
  AutoDisposeAsyncNotifierProviderElement<MessagesThreadData,
      Map<String, dynamic>> createElement() {
    return _MessagesThreadDataProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is MessagesThreadDataProvider && other.studentId == studentId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, studentId.hashCode);

    return _SystemHash.finish(hash);
  }
}

mixin MessagesThreadDataRef
    on AutoDisposeAsyncNotifierProviderRef<Map<String, dynamic>> {
  /// The parameter `studentId` of this provider.
  String get studentId;
}

class _MessagesThreadDataProviderElement
    extends AutoDisposeAsyncNotifierProviderElement<MessagesThreadData,
        Map<String, dynamic>> with MessagesThreadDataRef {
  _MessagesThreadDataProviderElement(super.provider);

  @override
  String get studentId => (origin as MessagesThreadDataProvider).studentId;
}
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member
